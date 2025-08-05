# @railblocks/error-sdk

JavaScript/TypeScript error reporting SDK using Trigger.dev HTTP API.

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

```typescript
import { createErrorClient } from './railblocks-error-sdk/packages/javascript/src';

const client = createErrorClient({ environment: 'production' });

// Report service error
await client.reportServiceError(
  'acme-corp',
  'payment',
  'Payment method declined',
  { userId: 'user_123' }
);

// Report known error
await client.reportKnownError(
  'acme-corp',
  'STRIPE-001',
  'Payment failed'
);
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
```typescript
import { createErrorClient } from './railblocks-error-sdk/packages/javascript/src';
```

## API

### `createErrorClient(options?)`

**Options:**
- `apiKey`: Trigger.dev API key (defaults to `TRIGGER_SECRET_KEY`)
- `taskId`: Task ID (defaults to `'ingest-error'`)
- `environment`: 'development' | 'staging' | 'production'
- `maxRetries`: number (default: 3)
- `retryDelay`: number in ms (default: 1000)
- `timeout`: number in ms (default: 10000)
- `defaultContext`: Record<string, any>

### Methods

```typescript
// Report service error (AI classification)
client.reportServiceError(companyCode, service, message, context?)

// Report known error code
client.reportKnownError(companyCode, errorCode, message, context?)

// Report with full payload
client.reportError(payload: IngestErrorPayload)
```

## Development

Since this is a git submodule, you can work on the SDK directly:

```bash
# Navigate to the JavaScript package
cd railblocks-error-sdk/packages/javascript

# Install dependencies (if you want to build/test)
npm install

# Build the package (if needed)
npm run build
```

## License

MIT 