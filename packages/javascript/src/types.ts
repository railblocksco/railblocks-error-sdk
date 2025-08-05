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
  runId?: string;
  message?: string;
  error?: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'API_ERROR';
}

export interface ErrorReportingOptions {
  // Trigger.dev configuration
  apiKey: string;         // Trigger.dev API key (required)
  taskId?: string;        // Task ID for error ingestion (defaults to 'ingest-error')
  
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