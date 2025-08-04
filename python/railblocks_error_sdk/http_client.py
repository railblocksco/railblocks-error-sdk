"""
HTTP client for the Railblocks Error SDK.

Python implementation that mirrors the TypeScript HttpErrorReportingClient exactly.
"""

import asyncio
import json
from typing import Dict, Any, Optional
import aiohttp
from .types import HttpErrorReportingResult, ErrorReportingOptions, IngestErrorPayload


class HttpErrorReportingClient:
    """Python wrapper for the TypeScript HttpErrorReportingClient."""
    
    def __init__(self, convex_url: str, convex_secret: str, options: Optional[ErrorReportingOptions] = None):
        if not convex_url:
            raise ValueError("Convex URL is required for HTTP transport")
        if not convex_secret:
            raise ValueError("Convex API secret is required for HTTP transport")
        
        self.convex_url = convex_url.rstrip('/')  # Remove trailing slash
        self.convex_secret = convex_secret
        
        # Set defaults matching TypeScript SDK
        options = options or ErrorReportingOptions()
        self.max_retries = options.max_retries or 3
        self.retry_delay = options.retry_delay or 1000
        self.timeout = options.timeout or 10000
        self.environment = options.environment or 'production'
        self.default_context = options.default_context or {}
    
    async def report_known_error(
        self,
        company_code: str,
        error_code: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> HttpErrorReportingResult:
        """Report an error with a known error code via HTTP."""
        payload = {
            "companyCode": company_code,
            "errorCode": error_code,
            "message": message,
            "context": {**self.default_context, **(context or {})},
            "environment": self.environment
        }
        
        return await self._make_request('/report-known-error', payload)
    
    async def report_service_error(
        self,
        company_code: str,
        service: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> HttpErrorReportingResult:
        """Report a service error for automatic classification via HTTP."""
        payload = {
            "companyCode": company_code,
            "service": service,
            "message": message,
            "context": {**self.default_context, **(context or {})},
            "environment": self.environment
        }
        
        return await self._make_request('/report-service-error', payload)
    
    async def report_error(self, payload: IngestErrorPayload) -> HttpErrorReportingResult:
        """Report an error with full context via HTTP."""
        enriched_payload = {
            "companyCode": payload.company_code,
            "message": payload.message,
            "errorCode": payload.error_code,
            "service": payload.service,
            "context": {**self.default_context, **(payload.context or {})},
            "environment": payload.environment or self.environment,
            "stackTrace": payload.stack_trace,
            "url": payload.url,
            "userAgent": payload.user_agent,
            "userId": payload.user_id,
            "sessionId": payload.session_id,
            "severity": payload.severity,
            "tags": payload.tags,
            "location": payload.location
        }
        
        return await self._make_request('/report-error', enriched_payload)
    
    async def _make_request(self, endpoint: str, payload: Dict[str, Any]) -> HttpErrorReportingResult:
        """Make HTTP request with retry logic matching TypeScript SDK exactly."""
        last_error: Optional[Exception] = None
        full_url = f"{self.convex_url}{endpoint}"
        
        for attempt in range(1, self.max_retries + 1):
            try:
                timeout = aiohttp.ClientTimeout(total=self.timeout / 1000)  # Convert to seconds
                
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(
                        full_url,
                        headers={
                            'Content-Type': 'application/json',
                            'Authorization': f'Bearer {self.convex_secret}'
                        },
                        json=payload
                    ) as response:
                        # Get the raw response text first to handle JSON parsing properly
                        response_text = await response.text()
                        
                        try:
                            result_data = json.loads(response_text)
                        except Exception as json_error:
                            raise Exception(f"Failed to parse JSON response: {json_error}")
                        
                        if not response.ok:
                            error_msg = f"HTTP {response.status}: {result_data.get('message', 'Unknown error')}"
                            raise Exception(error_msg)
                        
                        return HttpErrorReportingResult(
                            success=result_data.get('success', False),
                            trigger_id=result_data.get('triggerId'),
                            message=result_data.get('message'),
                            error=result_data.get('error')
                        )
                        
            except Exception as error:
                last_error = error
                
                if attempt < self.max_retries:
                    delay = self.retry_delay * (2 ** (attempt - 1)) / 1000  # Convert to seconds
                    await asyncio.sleep(delay)
        
        return HttpErrorReportingResult(
            success=False,
            error='NETWORK_ERROR',
            message=str(last_error) if last_error else 'Failed to report error after retries'
        )


def create_http_error_client(convex_url: str, convex_secret: str, options: Optional[ErrorReportingOptions] = None) -> HttpErrorReportingClient:
    """Create a new HTTP error reporting client instance - matches TypeScript API exactly."""
    return HttpErrorReportingClient(convex_url, convex_secret, options) 