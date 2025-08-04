import { ErrorReportingClient } from './client';
import { HttpErrorReportingClient } from './http-client';
import type { 
  IngestErrorPayload, 
  ErrorReportingResult, 
  ErrorReportingOptions,
  HttpErrorReportingResult,
  ErrorSeverity,
  ErrorCategory,
  Environment
} from './types';

/**
 * Create a new error reporting client instance
 */
export const createErrorClient = (options?: ErrorReportingOptions) => {
  return new ErrorReportingClient(options);
};

/**
 * Create a new HTTP error reporting client instance
 */
export const createHttpErrorClient = (convexUrl: string, convexSecret: string, options?: ErrorReportingOptions) => {
  return new HttpErrorReportingClient(convexUrl, convexSecret, options);
};

// Export the client classes and types
export { ErrorReportingClient, HttpErrorReportingClient };
export type { 
  IngestErrorPayload, 
  ErrorReportingResult, 
  ErrorReportingOptions,
  HttpErrorReportingResult,
  ErrorSeverity,
  ErrorCategory,
  Environment
}; 