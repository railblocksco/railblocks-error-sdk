import type { IngestErrorPayload, ErrorReportingResult, ErrorReportingOptions } from "./types";

export class ErrorReportingClient {
  private options: Required<Omit<ErrorReportingOptions, 'apiKey' | 'taskId'>>;
  private apiKey: string;
  private taskId: string;
  
  constructor(options: ErrorReportingOptions) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      timeout: options.timeout ?? 10000,
      environment: options.environment ?? 'production',
      defaultContext: options.defaultContext ?? {}
    };

    // API key is required
    this.apiKey = options.apiKey;
    this.taskId = options.taskId ?? 'ingest-error';
  }

  /**
   * Report an error with a known error code
   */
  async reportError(
    companyCode: string,
    errorCode: string,
    message: string,
    context?: Record<string, any>
  ): Promise<ErrorReportingResult> {
    return this.report({
      companyCode,
      errorCode,
      message,
      context: { ...this.options.defaultContext, ...context },
      environment: this.options.environment
    });
  }

  /**
   * Report an unknown error for AI classification
   */
  async reportUnknownError(
    companyCode: string,
    service: string,
    message: string,
    context?: Record<string, any>
  ): Promise<ErrorReportingResult> {
    return this.report({
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
  async report(payload: IngestErrorPayload): Promise<ErrorReportingResult> {
    // Only include non-undefined fields to match Python behavior
    const enrichedPayload: any = {
      companyCode: payload.companyCode,
      message: payload.message,
    };

    // Add optional fields only if they exist
    if (payload.errorCode !== undefined) enrichedPayload.errorCode = payload.errorCode;
    if (payload.service !== undefined) enrichedPayload.service = payload.service;
    if (payload.context !== undefined || Object.keys(this.options.defaultContext).length > 0) {
      enrichedPayload.context = { ...this.options.defaultContext, ...payload.context };
    }
    if (payload.environment !== undefined || this.options.environment !== 'production') {
      enrichedPayload.environment = payload.environment ?? this.options.environment;
    }
    if (payload.stackTrace !== undefined) enrichedPayload.stackTrace = payload.stackTrace;
    if (payload.url !== undefined) enrichedPayload.url = payload.url;
    if (payload.userAgent !== undefined) enrichedPayload.userAgent = payload.userAgent;
    if (payload.userId !== undefined) enrichedPayload.userId = payload.userId;
    if (payload.sessionId !== undefined) enrichedPayload.sessionId = payload.sessionId;
    if (payload.severity !== undefined) enrichedPayload.severity = payload.severity;
    if (payload.tags !== undefined) enrichedPayload.tags = payload.tags;
    if (payload.location !== undefined) enrichedPayload.location = payload.location;

    return this.triggerWithRetry(enrichedPayload);
  }

  private async triggerWithRetry(payload: IngestErrorPayload): Promise<ErrorReportingResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const response = await fetch(`https://api.trigger.dev/api/v1/tasks/${this.taskId}/trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            payload,
            context: {
              environment: payload.environment ?? this.options.environment,
              timestamp: Date.now() / 1000 // Unix timestamp to match Python
            },
            options: {
              idempotencyKey: `${payload.companyCode}-${payload.errorCode || payload.service}-${Date.now()}`,
              concurrencyKey: `${payload.companyCode}-${payload.errorCode || payload.service}`,
              queue: {
                name: "error-ingestion",
                concurrencyLimit: 10
              }
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        return {
          success: true,
          runId: result.id,
          message: 'Error reported successfully'
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