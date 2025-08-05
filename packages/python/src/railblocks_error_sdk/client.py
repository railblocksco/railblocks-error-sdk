"""
HTTP client for the Railblocks Error SDK.

Python implementation that uses Trigger.dev HTTP API directly.
"""

import asyncio
import json
import os
from typing import Dict, Any, Optional
import aiohttp
from .types import ErrorReportingResult, ErrorReportingOptions, IngestErrorPayload


class ErrorReportingClient:
    """Python client for error reporting using Trigger.dev HTTP API."""
    
    def __init__(self, options: Optional[ErrorReportingOptions] = None):
        options = options or ErrorReportingOptions()
        
        # Set defaults matching TypeScript SDK
        self.max_retries = options.max_retries or 3
        self.retry_delay = options.retry_delay or 1000
        self.timeout = options.timeout or 10000
        self.environment = options.environment or 'production'
        self.default_context = options.default_context or {}
        
        # Get API key from options or environment
        self.api_key = options.api_key or os.getenv('TRIGGER_SECRET_KEY')
        if not self.api_key:
            raise ValueError("Trigger.dev API key is required. Set TRIGGER_SECRET_KEY environment variable or pass api_key option.")
        
        self.task_id = options.task_id or 'ingest-error'
    
    async def report_known_error(
        self,
        company_code: str,
        error_code: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> ErrorReportingResult:
        """Report an error with a known error code."""
        payload = IngestErrorPayload(
            company_code=company_code,
            error_code=error_code,
            message=message,
            context={**self.default_context, **(context or {})},
            environment=self.environment
        )
        
        return await self.report_error(payload)
    
    async def report_service_error(
        self,
        company_code: str,
        service: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> ErrorReportingResult:
        """Report a service error for automatic classification."""
        payload = IngestErrorPayload(
            company_code=company_code,
            service=service,
            message=message,
            context={**self.default_context, **(context or {})},
            environment=self.environment
        )
        
        return await self.report_error(payload)
    
    async def report_error(self, payload: IngestErrorPayload) -> ErrorReportingResult:
        """Report an error with full context."""
        # Convert Python dataclass to dict for JSON serialization
        # Only include non-None fields to match TypeScript behavior
        payload_dict = {
            "companyCode": payload.company_code,
            "message": payload.message,
        }
        
        # Add optional fields only if they exist
        if payload.error_code is not None:
            payload_dict["errorCode"] = payload.error_code
        if payload.service is not None:
            payload_dict["service"] = payload.service
        if payload.context is not None or self.default_context:
            payload_dict["context"] = {**self.default_context, **(payload.context or {})}
        if payload.environment is not None or self.environment:
            payload_dict["environment"] = payload.environment or self.environment
        if payload.stack_trace is not None:
            payload_dict["stackTrace"] = payload.stack_trace
        if payload.url is not None:
            payload_dict["url"] = payload.url
        if payload.user_agent is not None:
            payload_dict["userAgent"] = payload.user_agent
        if payload.user_id is not None:
            payload_dict["userId"] = payload.user_id
        if payload.session_id is not None:
            payload_dict["sessionId"] = payload.session_id
        if payload.severity is not None:
            payload_dict["severity"] = payload.severity
        if payload.tags is not None:
            payload_dict["tags"] = payload.tags
        if payload.location is not None:
            payload_dict["location"] = payload.location
        
        return await self._trigger_with_retry(payload_dict)
    
    async def _trigger_with_retry(self, payload: Dict[str, Any]) -> ErrorReportingResult:
        """Make HTTP request to Trigger.dev API with retry logic."""
        last_error: Optional[Exception] = None
        
        for attempt in range(1, self.max_retries + 1):
            try:
                timeout = aiohttp.ClientTimeout(total=self.timeout / 1000)  # Convert to seconds
                
                # Prepare request body matching Trigger.dev API format
                request_body = {
                    "payload": payload,
                    "context": {
                        "environment": payload.get("environment", self.environment),
                        "timestamp": asyncio.get_event_loop().time()
                    },
                    "options": {
                        "idempotencyKey": f"{payload['companyCode']}-{payload.get('errorCode', payload.get('service', ''))}-{int(asyncio.get_event_loop().time() * 1000)}",
                        "concurrencyKey": f"{payload['companyCode']}-{payload.get('errorCode', payload.get('service', ''))}",
                        "queue": {
                            "name": "error-ingestion",
                            "concurrencyLimit": 10
                        }
                    }
                }
                
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(
                        f"https://api.trigger.dev/api/v1/tasks/{self.task_id}/trigger",
                        headers={
                            'Content-Type': 'application/json',
                            'Authorization': f'Bearer {self.api_key}'
                        },
                        json=request_body
                    ) as response:
                        # Get the raw response text first to handle JSON parsing properly
                        response_text = await response.text()
                        
                        if not response.ok:
                            error_msg = f"HTTP {response.status}: {response_text}"
                            raise Exception(error_msg)
                        
                        try:
                            result_data = json.loads(response_text)
                        except Exception as json_error:
                            raise Exception(f"Failed to parse JSON response: {json_error}")
                        
                        return ErrorReportingResult(
                            success=True,
                            run_id=result_data.get('id'),
                            message='Error reported successfully'
                        )
                        
            except Exception as error:
                last_error = error
                
                if attempt < self.max_retries:
                    delay = self.retry_delay * (2 ** (attempt - 1)) / 1000  # Convert to seconds
                    await asyncio.sleep(delay)
        
        return ErrorReportingResult(
            success=False,
            error='NETWORK_ERROR',
            message=str(last_error) if last_error else 'Failed to report error after retries'
        )


def create_error_client(options: Optional[ErrorReportingOptions] = None) -> ErrorReportingClient:
    """Create a new error reporting client instance - matches TypeScript API exactly."""
    return ErrorReportingClient(options) 