# railblocks-error-sdk

Python error reporting SDK using Trigger.dev HTTP API.

## Installation

This is a git submodule. Add it to your project:

```bash
# Add the submodule to your project
git submodule add https://github.com/railblocksco/railblocks-error-sdk.git
```

### Updating the Submodule

To get the latest version of the SDK:

```bash
# Update to the latest commit
git submodule update --remote railblocks-error-sdk
```

## Quick Start

```python
import asyncio
from railblocks_error_sdk.packages.python.src import create_error_client

async def main():
    client = create_error_client({'environment': 'production'})
    
    # Report service error (AI classification)
    await client.report_service_error(
        'acme-corp',
        'payment',
        'Payment method declined',
        {'user_id': 'user_123'}
    )
    
    # Report known error code
    await client.report_known_error(
        'acme-corp',
        'STRIPE-001',
        'Payment failed'
    )

asyncio.run(main())
```

## Environment Setup

```bash
export TRIGGER_SECRET_KEY=tr_dev_your_api_key
```

## Quick Reference

### Adding to a New Project
```bash
git submodule add https://github.com/railblocksco/railblocks-error-sdk.git
git submodule update --init --recursive
```

### Updating in Existing Project
```bash
git submodule update --remote railblocks-error-sdk
git add railblocks-error-sdk
git commit -m "Update SDK"
```

### Import in Your Code
```python
from railblocks_error_sdk.packages.python.src import create_error_client
```

## API

### `create_error_client(options?)`

**Options:**
- `api_key`: Trigger.dev API key (defaults to `TRIGGER_SECRET_KEY`)
- `task_id`: Task ID (defaults to `'ingest-error'`)
- `environment`: 'development' | 'staging' | 'production'
- `max_retries`: number (default: 3)
- `retry_delay`: number in ms (default: 1000)
- `timeout`: number in ms (default: 10000)
- `default_context`: dict

### Methods

```python
# Report service error (AI classification)
client.report_service_error(company_code, service, message, context?)

# Report known error code
client.report_known_error(company_code, error_code, message, context?)

# Report with full payload
client.report_error(payload: IngestErrorPayload)
```

## Development

Since this is a git submodule, you can work on the SDK directly:

```bash
# Navigate to the Python package
cd railblocks-error-sdk/packages/python

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install aiohttp

# Test the SDK
python3 test_client.py
```

## License

MIT 