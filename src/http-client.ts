import type { IngestErrorPayload, HttpErrorReportingResult, ErrorReportingOptions } from "./types";

export class HttpErrorReportingClient {
  private convexUrl: string;
  private convexSecret: string;
  private options: Required<Pick<ErrorReportingOptions, 'maxRetries' | 'retryDelay' | 'timeout' | 'environment' | 'defaultContext'>>;
  
  constructor(convexUrl: string, convexSecret: string, options: ErrorReportingOptions = {}) {
    if (!convexUrl) {
      throw new Error("Convex URL is required for HTTP transport");
    }
    if (!convexSecret) {
      throw new Error("Convex API secret is required for HTTP transport");
    }

    this.convexUrl = convexUrl.replace(/\/$/, ''); // Remove trailing slash
    this.convexSecret = convexSecret;
    
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      timeout: options.timeout ?? 10000,
      environment: options.environment ?? 'production',
      defaultContext: options.defaultContext ?? {}
    };
  }

  /**
   * Report an error with a known error code via HTTP
   */
  async reportKnownError(
    companyCode: string,
    errorCode: string,
    message: string,
    context?: Record<string, any>
  ): Promise<HttpErrorReportingResult> {
    const payload = {
      companyCode,
      errorCode,
      message,
      context: { ...this.options.defaultContext, ...context },
      environment: this.options.environment
    };

    return this.makeRequest('/report-known-error', payload);
  }

  /**
   * Report a service error for automatic classification via HTTP
   */
  async reportServiceError(
    companyCode: string,
    service: string,
    message: string,
    context?: Record<string, any>
  ): Promise<HttpErrorReportingResult> {
    const payload = {
      companyCode,
      service,
      message,
      context: { ...this.options.defaultContext, ...context },
      environment: this.options.environment
    };

    return this.makeRequest('/report-service-error', payload);
  }

  /**
   * Report an error with full context via HTTP
   */
  async reportError(payload: IngestErrorPayload): Promise<HttpErrorReportingResult> {
    const enrichedPayload = {
      ...payload,
      context: { ...this.options.defaultContext, ...payload.context },
      environment: payload.environment ?? this.options.environment
    };

    return this.makeRequest('/report-error', enrichedPayload);
  }

  private async makeRequest(endpoint: string, payload: any): Promise<HttpErrorReportingResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        const response = await fetch(`${this.convexUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.convexSecret}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await response.json() as HttpErrorReportingResult;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${result.message || 'Unknown error'}`);
        }

        return result;
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