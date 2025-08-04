import { tasks } from "@trigger.dev/sdk/v3";
import type { IngestErrorPayload, ErrorReportingResult, ErrorReportingOptions } from "./types";
import { HttpErrorReportingClient } from "./http-client";

export class ErrorReportingClient {
  private options: Required<Omit<ErrorReportingOptions, 'convexUrl' | 'convexSecret'>> & Pick<ErrorReportingOptions, 'convexUrl' | 'convexSecret'>;
  private httpClient?: HttpErrorReportingClient;
  
  constructor(options: ErrorReportingOptions = {}) {
    this.options = {
      transport: options.transport ?? 'trigger',
      convexUrl: options.convexUrl,
      convexSecret: options.convexSecret,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      timeout: options.timeout ?? 10000,
      environment: options.environment ?? 'production',
      defaultContext: options.defaultContext ?? {}
    };

    // Initialize HTTP client if using HTTP transport
    if (this.options.transport === 'http') {
      if (!this.options.convexUrl || !this.options.convexSecret) {
        throw new Error("convexUrl and convexSecret are required when using HTTP transport");
      }
      this.httpClient = new HttpErrorReportingClient(
        this.options.convexUrl, 
        this.options.convexSecret, 
        this.options
      );
    }
  }

  /**
   * Report an error with a known error code
   * Creates the error group if it doesn't exist
   */
  async reportKnownError(
    companyCode: string,
    errorCode: string,
    message: string,
    context?: Record<string, any>
  ): Promise<ErrorReportingResult> {
    if (this.options.transport === 'http' && this.httpClient) {
      const result = await this.httpClient.reportKnownError(companyCode, errorCode, message, context);
      return this.normalizeHttpResult(result);
    }

    return this.reportError({
      companyCode,
      errorCode,
      message,
      context: { ...this.options.defaultContext, ...context },
      environment: this.options.environment
    });
  }

  /**
   * Report a service error for automatic classification
   * Uses AI to categorize and find similar errors
   */
  async reportServiceError(
    companyCode: string,
    service: string,
    message: string,
    context?: Record<string, any>
  ): Promise<ErrorReportingResult> {
    if (this.options.transport === 'http' && this.httpClient) {
      const result = await this.httpClient.reportServiceError(companyCode, service, message, context);
      return this.normalizeHttpResult(result);
    }

    return this.reportError({
      companyCode,
      service,
      message,
      context: { ...this.options.defaultContext, ...context },
      environment: this.options.environment
    });
  }

  /**
   * Report an error with full context
   */
  async reportError(payload: IngestErrorPayload): Promise<ErrorReportingResult> {
    const enrichedPayload = {
      ...payload,
      context: { ...this.options.defaultContext, ...payload.context },
      environment: payload.environment ?? this.options.environment
    };

    if (this.options.transport === 'http' && this.httpClient) {
      const result = await this.httpClient.reportError(enrichedPayload);
      return this.normalizeHttpResult(result);
    }

    return this.triggerWithRetry(enrichedPayload);
  }

  /**
   * Normalize HTTP client result to match ErrorReportingResult interface
   */
  private normalizeHttpResult(httpResult: any): ErrorReportingResult {
    if (httpResult.success) {
      return {
        success: true,
        groupId: httpResult.triggerId,
        groupCode: `http-${httpResult.triggerId}`,
        occurrenceId: httpResult.triggerId,
        action: 'created_new' as const,
        message: httpResult.message
      };
    } else {
      return {
        success: false,
        error: httpResult.error as any,
        message: httpResult.message
      };
    }
  }

  private async triggerWithRetry(payload: IngestErrorPayload): Promise<ErrorReportingResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        // Trigger.dev returns a handle, not our result type
        const handle = await tasks.trigger("ingest-error", payload);
        
        // For now, we'll return a success result since the trigger succeeded
        // In a real implementation, you might want to poll the handle for the actual result
        return {
          success: true,
          groupId: handle.id, // Use the handle ID as group ID for now
          groupCode: `trigger-${handle.id}`,
          occurrenceId: handle.id,
          action: 'created_new' as const
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.options.maxRetries) {
          const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: lastError?.message ?? 'Failed to report error after retries'
    };
  }
} 