# Railblocks Error SDK

Simple error reporting SDK using Trigger.dev HTTP API.

## Packages

- **[JavaScript/TypeScript](./packages/javascript/)** - `@railblocks/error-sdk`
- **[Python](./packages/python/)** - `railblocks-error-sdk`

## Quick Start

### JavaScript/TypeScript

```bash
npm install @railblocks/error-sdk
```

```typescript
import { createErrorClient } from '@railblocks/error-sdk';

const client = createErrorClient({ environment: 'production' });
await client.reportServiceError('company', 'service', 'Error message');
```

### Python

```bash
pip install railblocks-error-sdk
```

```python
import asyncio
from railblocks_error_sdk import create_error_client

async def main():
    client = create_error_client({'environment': 'production'})
    await client.report_service_error('company', 'service', 'Error message')

asyncio.run(main())
```

## Environment Setup

```bash
export TRIGGER_SECRET_KEY=tr_dev_your_api_key
```

## Development

```bash
# JavaScript/TypeScript
cd packages/javascript
npm install
npm run build

# Python
cd packages/python
pip install -e .
```

## License

MIT 