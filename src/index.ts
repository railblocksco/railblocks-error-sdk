import { tasks } from "@trigger.dev/sdk/v3";
import { ErrorReportingClient } from './client';
import type { 
  IngestErrorPayload, 
  ErrorReportingResult, 
  ErrorReportingOptions,
  ErrorSeverity,
  ErrorCategory,
  Environment
} from './types';

// Global instance for easy use
let globalReporter: ErrorReportingClient | null = null;

/**
 * Initialize the error reporting client with configuration
 */
export function initErrorReporting(options?: ErrorReportingOptions): ErrorReportingClient {
  globalReporter = new ErrorReportingClient(options);
  return globalReporter;
}

/**
 * Get the global error reporting client instance
 */
export function getErrorReporter(): ErrorReportingClient | null {
  return globalReporter;
}

/**
 * Report an error with a known error code
 * Creates the error group if it doesn't exist
 */
export const reportKnownError = async (
  companyCode: string,
  errorCode: string,
  message: string,
  context?: Record<string, any>
): Promise<ErrorReportingResult> => {
  if (!globalReporter) {
    console.error('Error reporter not initialized. Call initErrorReporting() first.');
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Error reporter not initialized'
    };
  }
  return globalReporter.reportKnownError(companyCode, errorCode, message, context);
};

/**
 * Report a service error for automatic classification
 * Uses AI to categorize and find similar errors
 */
export const reportServiceError = async (
  companyCode: string,
  service: string,
  message: string,
  context?: Record<string, any>
): Promise<ErrorReportingResult> => {
  if (!globalReporter) {
    console.error('Error reporter not initialized. Call initErrorReporting() first.');
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Error reporter not initialized'
    };
  }
  return globalReporter.reportServiceError(companyCode, service, message, context);
};

/**
 * Report an error with full context
 */
export const reportError = async (payload: IngestErrorPayload): Promise<ErrorReportingResult> => {
  if (!globalReporter) {
    console.error('Error reporter not initialized. Call initErrorReporting() first.');
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Error reporter not initialized'
    };
  }
  return globalReporter.reportError(payload);
};

/**
 * Create a new error reporting client instance
 */
export const createErrorClient = (options?: ErrorReportingOptions) => {
  return new ErrorReportingClient(options);
};

// Export the client class for advanced usage
export { ErrorReportingClient }; 