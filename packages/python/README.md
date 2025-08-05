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

### Local Development
```python
import asyncio
from railblocks_error_sdk import create_error_client, ErrorReportingOptions

async def main():
    client = create_error_client(ErrorReportingOptions(environment='production'))
    
    # Report unknown error (AI classification)
    await client.report_unknown_error(
        'acme-corp',
        'payment',
        'Payment method declined',
        {'user_id': 'user_123'}
    )
    
    # Report known error code
    await client.report_error(
        'acme-corp',
        'STRIPE-001',
        'Payment failed'
    )

asyncio.run(main())
```

### Modal Integration

```python
from modal import Image, App

# Define path to the SDK
SDK_PATH = "lib/railblocks-error-sdk"

image = (
    Image.debian_slim(python_version="3.12")
    .pip_install_from_requirements("requirements.txt")
    .add_local_dir("lib/railblocks-error-sdk", "/tmp/sdk", copy=True)
    .run_commands("pip install -e /tmp/sdk/packages/python")
)

app = App("my-app", image=image)

# Usage
@app.function()
def my_function():
    from railblocks_error_sdk import create_error_client, ErrorReportingOptions
    
    client = create_error_client(ErrorReportingOptions(environment='production'))
    await client.report_unknown_error('acme-corp', 'payment', 'Payment failed')
```

**Local Development:**
```bash
cd lib/railblocks-error-sdk/packages/python && pip install -e .
```
Then set IDE interpreter to `./.venv/bin/python`

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
from railblocks_error_sdk import create_error_client, ErrorReportingOptions
```

## API

### `create_error_client(options?)`

**Options:**
- `options`: `ErrorReportingOptions` object with:
  - `api_key`: Trigger.dev API key (defaults to `TRIGGER_SECRET_KEY`)
  - `task_id`: Task ID (defaults to `'ingest-error'`)
  - `environment`: 'development' | 'staging' | 'production'
  - `max_retries`: number (default: 3)
  - `retry_delay`: number in ms (default: 1000)
  - `timeout`: number in ms (default: 10000)
  - `default_context`: dict

### Methods

```python
# Report unknown error (AI classification)
client.report_unknown_error(company_code, service, message, context?)

# Report known error code
client.report_error(company_code, error_code, message, context?)

# Report with full payload
client.report(payload: IngestErrorPayload)
```

## Development

Since this is a git submodule, you can work on the SDK directly:

```bash
# Navigate to the Python package
cd railblocks-error-sdk/packages/python

# Install in editable mode
pip install -e .

# Test the SDK
python3 test_client.py
```



## License

MIT 