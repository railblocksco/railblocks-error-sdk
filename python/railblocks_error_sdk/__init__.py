"""
Railblocks AI-powered error reporting SDK with automatic classification and semantic similarity.

Python implementation of the @railblocks/error-sdk.
"""

from .http_client import HttpErrorReportingClient, create_http_error_client
from .types import (
    IngestErrorPayload,
    ErrorReportingResult,
    ErrorReportingOptions,
    HttpErrorReportingResult,
    ErrorSeverity,
    ErrorCategory,
    Environment
)

__version__ = "0.0.1"

# Export the main functions to match TypeScript API
__all__ = [
    "create_http_error_client",
    "HttpErrorReportingClient",
    "IngestErrorPayload",
    "ErrorReportingResult", 
    "ErrorReportingOptions",
    "HttpErrorReportingResult",
    "ErrorSeverity",
    "ErrorCategory",
    "Environment"
] 