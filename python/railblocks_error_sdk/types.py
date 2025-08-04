"""
Type definitions for the Railblocks Error SDK.

Mirrors the TypeScript types exactly.
"""

from typing import Dict, Any, Optional, Union, List
from dataclasses import dataclass

# Type definitions matching the TypeScript SDK
ErrorSeverity = Union[str, 'critical', 'high', 'medium', 'low']
ErrorCategory = Union[str, 'auth', 'api', 'network', 'database', 'payment', 'integration', 'validation', 'system', 'other']
Environment = Union[str, 'development', 'staging', 'production']

@dataclass
class IngestErrorPayload:
    """Payload for error ingestion - matches TypeScript interface exactly."""
    company_code: str
    message: str
    error_code: Optional[str] = None
    service: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    stack_trace: Optional[str] = None
    url: Optional[str] = None
    user_agent: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    environment: Optional[Environment] = None
    severity: Optional[ErrorSeverity] = None
    tags: Optional[List[str]] = None
    location: Optional[str] = None

@dataclass
class ErrorReportingOptions:
    """Options for error reporting - matches TypeScript interface exactly."""
    transport: Optional[str] = None
    convex_url: Optional[str] = None
    convex_secret: Optional[str] = None
    max_retries: Optional[int] = None
    retry_delay: Optional[int] = None
    timeout: Optional[int] = None
    environment: Optional[Environment] = None
    default_context: Optional[Dict[str, Any]] = None

@dataclass
class ErrorReportingResult:
    """Result from error reporting - matches TypeScript interface exactly."""
    success: bool
    group_id: Optional[str] = None
    group_code: Optional[str] = None
    occurrence_id: Optional[str] = None
    action: Optional[str] = None  # 'created_new' | 'added_to_existing' | 'matched_similar'
    message: Optional[str] = None
    error: Optional[str] = None  # 'VALIDATION_ERROR' | 'AI_ERROR' | 'CONVEX_ERROR' | 'NETWORK_ERROR'

@dataclass
class HttpErrorReportingResult:
    """Result from HTTP error reporting - matches TypeScript interface exactly."""
    success: bool
    trigger_id: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None  # 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'CONVEX_ERROR' 