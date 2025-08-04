export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ErrorCategory = 'auth' | 'api' | 'network' | 'database' | 'payment' | 'integration' | 'validation' | 'system' | 'other';
export type Environment = 'development' | 'staging' | 'production';

export interface IngestErrorPayload {
  // Required fields
  companyCode: string;
  message: string;
  
  // Error identification (one of these required)
  errorCode?: string;
  service?: string;
  
  // Optional enrichment
  context?: Record<string, any>;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  environment?: Environment;
  
  // Override AI classification
  severity?: ErrorSeverity;
  tags?: string[];
  
  // For debugging
  location?: string;
}

export interface ErrorReportingResult {
  success: boolean;
  groupId?: string;
  groupCode?: string;
  occurrenceId?: string;
  action?: 'created_new' | 'added_to_existing' | 'matched_similar';
  message?: string;
  error?: 'VALIDATION_ERROR' | 'AI_ERROR' | 'CONVEX_ERROR' | 'NETWORK_ERROR';
}

export interface ErrorReportingOptions {
  // Transport configuration
  transport?: 'trigger' | 'http';
  
  // HTTP transport options
  convexUrl?: string;        // Convex deployment URL for HTTP transport
  convexSecret?: string;     // Convex API secret for HTTP transport
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  
  // Timeout configuration
  timeout?: number;
  
  // Environment overrides
  environment?: Environment;
  
  // Default context
  defaultContext?: Record<string, any>;
}

export interface HttpErrorReportingResult {
  success: boolean;
  triggerId?: string;
  message?: string;
  error?: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'CONVEX_ERROR';
} 