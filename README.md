# @railblocks/error-sdk

Railblocks AI-powered error reporting SDK with automatic classification, semantic similarity matching, and intelligent grouping. This SDK provides a simple interface to report errors to the Railblocks error ingestion system.

## Features

- 🤖 **AI-Powered Classification**: Automatic error categorization and severity assessment
- 🔍 **Semantic Similarity**: Groups similar errors using embeddings
- 🔄 **Built-in Retry Logic**: Automatic retry with exponential backoff
- 🛡️ **Type Safety**: Full TypeScript support
- 📱 **Framework Agnostic**: Works in any JavaScript/TypeScript environment
- 🎯 **Simple API**: Easy-to-use convenience functions

## Installation

### Option 1: Git Submodule (Recommended for external clients)

```bash
# Add as submodule to your project
git submodule add https://github.com/railblocksco/railblocks-error-sdk.git lib/railblocks-error-sdk
git submodule update --init --recursive

# Install Trigger.dev SDK dependency
npm install @trigger.dev/sdk@^3.0.0
```

### Option 2: NPM Package (For internal use)

```bash
npm install @railblocks/error-sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import { initErrorReporting } from '@railblocks/error-sdk';

// Initialize once at app startup
initErrorReporting({
  environment: 'production',
  defaultContext: {
    appName: 'my-awesome-app',
    version: '1.0.0'
  }
});
```

### 2. Report Errors

```typescript
import { reportServiceError, reportKnownError } from '@railblocks/error-sdk';

// Report service error (auto-classified by AI)
await reportServiceError(
  'acme-corp',           // Company code
  'payment',             // Service name
  'Payment method declined', // Error message
  { userId: 'user_123', amount: 5000 } // Context
);

// Report with known error code
await reportKnownError(
  'acme-corp',
  'STRIPE-001',          // Error code
  'Payment failed',
  { customerId: 'cus_123' }
);
```

## API Reference

### Initialization

```typescript
initErrorReporting(options?: ErrorReportingOptions): ErrorReportingClient
```

**Options:**
- `environment`: 'development' | 'staging' | 'production' (default: 'production')
- `maxRetries`: number (default: 3)
- `retryDelay`: number in ms (default: 1000)
- `timeout`: number in ms (default: 10000)
- `defaultContext`: Record<string, any> (default: {})

### Convenience Functions

```typescript
// Report service error (AI classification)
reportServiceError(
  companyCode: string,
  service: string,
  message: string,
  context?: Record<string, any>
): Promise<ErrorReportingResult>

// Report known error code
reportKnownError(
  companyCode: string,
  errorCode: string,
  message: string,
  context?: Record<string, any>
): Promise<ErrorReportingResult>

// Report with full payload
reportError(payload: IngestErrorPayload): Promise<ErrorReportingResult>
```

### Advanced Usage

```typescript
import { createErrorClient } from '@railblocks/error-sdk';

// Create custom client instance
const errorClient = createErrorClient({
  maxRetries: 5,
  retryDelay: 2000,
  environment: 'production',
  defaultContext: {
    version: '1.0.0',
    buildId: process.env.BUILD_ID
  }
});

// Use the client
await errorClient.reportServiceError('acme-corp', 'payment', 'Error message');
```

## Error Handling

The SDK includes built-in retry logic and error handling:

```typescript
const result = await reportServiceError('acme-corp', 'payment', 'Error');

if (result.success) {
  console.log('Error reported successfully:', result.groupCode);
} else {
  console.error('Failed to report error:', result.message);
}
```

## Environment Setup

### Required Environment Variables

```bash
# Trigger.dev secret key (get from railblocks-ops project)
TRIGGER_SECRET_KEY=trigger_sk_dev_xxx

# Optional: Override default environment
NODE_ENV=production
```

### React/Vite Example

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'process.env.TRIGGER_SECRET_KEY': JSON.stringify(process.env.TRIGGER_SECRET_KEY)
  }
});
```

## Error Payload Fields

### Required Fields
- `companyCode`: Company identifier (e.g., "acme-corp")
- `message`: The error message
- `service` OR `errorCode`: Service name or specific error code

### Optional Fields
- `context`: Additional context as key-value pairs
- `stackTrace`: Full stack trace for debugging
- `url`: URL where error occurred
- `userAgent`: Browser user agent
- `userId`: User who encountered the error
- `sessionId`: Session identifier
- `environment`: Environment ('development' | 'staging' | 'production')
- `location`: Code location for debugging
- `severity`: Override AI classification ('critical' | 'high' | 'medium' | 'low')
- `tags`: Array of searchable tags

## Examples

### React Component

```typescript
import { reportServiceError } from '@railblocks/error-sdk';

const PaymentForm = () => {
  const handlePayment = async () => {
    try {
      await processPayment();
    } catch (error) {
      await reportServiceError(
        'acme-corp',
        'payment',
        error.message,
        { 
          userId: user.id,
          amount: paymentAmount,
          paymentMethod: 'card'
        }
      );
      throw error; // Re-throw to show user error
    }
  };

  return <button onClick={handlePayment}>Pay</button>;
};
```

### Node.js/Express

```typescript
import { reportServiceError } from '@railblocks/error-sdk';

app.post('/api/payment', async (req, res) => {
  try {
    const result = await stripe.paymentIntents.create(req.body);
    res.json(result);
  } catch (error) {
    await reportServiceError(
      'acme-corp',
      'stripe',
      error.message,
      { 
        userId: req.user.id,
        amount: req.body.amount,
        endpoint: '/api/payment'
      }
    );
    res.status(500).json({ error: 'Payment failed' });
  }
});
```

### Error Boundary (React)

```typescript
import { reportError } from '@railblocks/error-sdk';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    reportError({
      companyCode: 'acme-corp',
      service: 'react-app',
      message: error.message,
      stackTrace: error.stack,
      context: {
        componentStack: errorInfo.componentStack,
        url: window.location.href
      }
    });
  }

  render() {
    return this.props.children;
  }
}
```

## Troubleshooting

### Common Issues

1. **"Error reporter not initialized"**
   - Call `initErrorReporting()` before using the convenience functions

2. **"TRIGGER_SECRET_KEY not found"**
   - Ensure the environment variable is set correctly
   - Check that the key is valid for the railblocks-ops project

3. **Network errors**
   - The SDK includes automatic retry logic
   - Check your internet connection and firewall settings

4. **Type errors**
   - Ensure you're using TypeScript 5.0+ and @trigger.dev/sdk v3

## Contributing

This SDK is part of the Railblocks ecosystem. For issues or contributions, please contact the Railblocks team.

## License

MIT License - see LICENSE file for details. 