import { ErrorReportingClient } from './client';
import type { 
  IngestErrorPayload, 
  ErrorReportingResult, 
  ErrorReportingOptions,
  ErrorSeverity,
  ErrorCategory,
  Environment
} from './types';

// Export the client class and factory function
export { ErrorReportingClient };
export const createErrorClient = (options: ErrorReportingOptions) => {
  return new ErrorReportingClient(options);
};
export type { 
  IngestErrorPayload, 
  ErrorReportingResult, 
  ErrorReportingOptions,
  ErrorSeverity,
  ErrorCategory,
  Environment
}; 