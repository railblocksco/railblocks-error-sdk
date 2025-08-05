"""
Railblocks Error SDK for Python.

A simple SDK for reporting errors to Trigger.dev.
"""

from .client import (
    ErrorReportingClient, 
    create_error_client
)
from .types import (
    IngestErrorPayload,
    ErrorReportingResult,
    ErrorReportingOptions,
    ErrorSeverity,
    ErrorCategory,
    Environment
)

__version__ = "0.0.3"

__all__ = [
    "ErrorReportingClient",
    "create_error_client",
    "IngestErrorPayload",
    "ErrorReportingResult", 
    "ErrorReportingOptions",
    "ErrorSeverity",
    "ErrorCategory",
    "Environment"
] 