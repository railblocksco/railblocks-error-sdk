# Railblocks Error SDK - Python

Python implementation of the Railblocks Error SDK with automatic classification and semantic similarity.

## Installation

```bash
pip install railblocks-error-sdk
```

## Quick Start

```python
import asyncio
from railblocks_error_sdk import create_http_error_client

async def main():
    # Create client
    client = create_http_error_client(
        convex_url="https://your-convex-deployment.convex.site",
        convex_secret="your-convex-api-secret"
    )
    
    # Report a known error
    result = await client.report_known_error(
        company_code="my-company",
        error_code="AUTH-001", 
        message="Authentication failed"
    )
    
    print(f"Success: {result.success}")

# Run
asyncio.run(main())
```

## API Reference

### `create_http_error_client(convex_url, convex_secret, options?)`

Creates a new HTTP error reporting client.

**Parameters:**
- `convex_url` (str): Your Convex deployment URL (must end with `.convex.site`)
- `convex_secret` (str): Your Convex API secret
- `options` (ErrorReportingOptions, optional): Configuration options

### `client.report_known_error(company_code, error_code, message, context?)`

Report an error with a known error code.

**Parameters:**
- `company_code` (str): Your company identifier
- `error_code` (str): Known error code
- `message` (str): Error message
- `context` (dict, optional): Additional context

### `client.report_service_error(company_code, service, message, context?)`

Report a service error for automatic classification.

**Parameters:**
- `company_code` (str): Your company identifier
- `service` (str): Service name (e.g., "database", "api")
- `message` (str): Error message
- `context` (dict, optional): Additional context

### `client.report_error(payload)`

Report an error with full context.

**Parameters:**
- `payload` (IngestErrorPayload): Complete error payload

## Type Definitions

All types mirror the TypeScript SDK exactly:

- `IngestErrorPayload`
- `ErrorReportingOptions` 
- `HttpErrorReportingResult`
- `ErrorSeverity`
- `ErrorCategory`
- `Environment`

## Development

```bash
cd python
pip install -e .
```

## License

MIT License - see the main README for details. 