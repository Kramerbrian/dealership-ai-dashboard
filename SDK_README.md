# DealershipAI SDK Documentation

## Overview

The DealershipAI SDK provides programmatic access to AI visibility tracking, hallucination risk prevention, and autonomous strategy recommendations for automotive dealerships.

## Installation

### TypeScript/JavaScript
```bash
npm install @dealershipai/sdk
# or
yarn add @dealershipai/sdk
# or
pnpm add @dealershipai/sdk
```

### Python
```bash
pip install dealershipai-sdk
```

## Authentication

All API calls require Bearer token authentication with tenant-scoped access:

```typescript
// TypeScript
import { DealershipAI } from '@dealershipai/sdk';

const api = new DealershipAI({
  baseUrl: 'https://api.dealershipai.com',
  token: 'your-bearer-token'
});
```

```python
# Python
from dealershipai import DealershipAI

api = DealershipAI(
    base_url='https://api.dealershipai.com',
    token='your-bearer-token'
)
```

## Key Features

### 1. AI Visibility Index (AVI)
Track your dealership's visibility across AI platforms like Google SGE, Perplexity, and Gemini.

```typescript
// Get latest AVI report
const report = await api.aviLatest('tenant-id');
console.log(`AIV Score: ${report.aiv}`);

// Get historical data
const history = await api.aviHistory('tenant-id', 30);
```

```python
# Get latest AVI report
report = api.avi_latest('tenant-id')
print(f"AIV Score: {report['aiv']}")

# Get historical data
history = api.avi_history('tenant-id', limit=30)
```

### 2. Hallucination Risk Prevention (HRP)
Prevent AI hallucination in dealership content with automated scanning and quarantine.

```typescript
// Run HRP scan
await api.hrpScan('tenant-id');

// Check status
const status = await api.hrpStatus('tenant-id');
console.log(`Quarantined topics: ${status.quarantine.length}`);

// Resolve quarantine
await api.hrpResolve('tenant-id', 'Price');
```

```python
# Run HRP scan
api.hrp_scan('tenant-id')

# Check status
status = api.hrp_status('tenant-id')
print(f"Quarantined topics: {len(status['quarantine'])}")

# Resolve quarantine
api.hrp_resolve('tenant-id', 'Price')
```

### 3. Autonomous Strategy Recommendations (ASR)
Get AI-powered optimization suggestions for your VDPs.

```typescript
// Generate recommendations
const recommendations = await api.asrExecute(
  'tenant-id',
  ['vdp-123', 'vdp-456'],
  api.generateIdempotencyKey(),
  {
    includeCompetitors: true,
    analysisDepth: 'deep'
  }
);
```

```python
# Generate recommendations
recommendations = api.asr_execute(
    'tenant-id',
    ['vdp-123', 'vdp-456'],
    api.generate_idempotency_key(),
    include_competitors=True,
    analysis_depth='deep'
)
```

## API Reference

### TypeScript SDK

#### Constructor
```typescript
new DealershipAI(config: {
  baseUrl: string;
  token: string;
  fetcher?: Fetcher;
  timeout?: number;
})
```

#### Methods

**AVI Methods:**
- `aviLatest(tenantId: string): Promise<AVIReport>`
- `aviHistory(tenantId: string, limit?: number, before?: string): Promise<AVIHistoryResponse>`

**ASR Methods:**
- `asrExecute(tenantId: string, vdpIds: string[], idempotencyKey: string, options?: ASROptions): Promise<ASRResponse>`

**HRP Methods:**
- `hrpScan(tenantId: string): Promise<ScanResponse>`
- `hrpStatus(tenantId: string): Promise<HRPStatusResponse>`
- `hrpResolve(tenantId: string, topic: string): Promise<ResolveResponse>`

**Utility Methods:**
- `generateIdempotencyKey(): string`
- `batchHrpResolve(tenantId: string, topics: string[]): Promise<BatchResult[]>`

### Python SDK

#### Constructor
```python
DealershipAI(base_url: str, token: str, timeout: int = 30)
```

#### Methods

**AVI Methods:**
- `avi_latest(tenant_id: str) -> Dict[str, Any]`
- `avi_history(tenant_id: str, limit: int = 8, before: Optional[str] = None) -> Dict[str, Any]`

**ASR Methods:**
- `asr_execute(tenant_id: str, vdp_ids: List[str], idempotency_key: str, **options) -> Dict[str, Any]`

**HRP Methods:**
- `hrp_scan(tenant_id: str) -> Dict[str, Any]`
- `hrp_status(tenant_id: str) -> Dict[str, Any]`
- `hrp_resolve(tenant_id: str, topic: str) -> Dict[str, Any]`

**Utility Methods:**
- `generate_idempotency_key() -> str`
- `batch_hrp_resolve(tenant_id: str, topics: List[str]) -> List[Dict[str, Any]]`
- `get_quarantined_topics(tenant_id: str) -> List[str]`
- `is_topic_quarantined(tenant_id: str, topic: str) -> bool`

## Error Handling

### TypeScript
```typescript
try {
  const result = await api.aviLatest('tenant-id');
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed');
  } else if (error.message.includes('404')) {
    console.error('No data found');
  } else {
    console.error('API Error:', error.message);
  }
}
```

### Python
```python
try:
    result = api.avi_latest('tenant-id')
except APIError as e:
    if e.status_code == 401:
        print('Authentication failed')
    elif e.status_code == 404:
        print('No data found')
    else:
        print(f'API Error: {e.message}')
except DealershipAIError as e:
    print(f'SDK Error: {e}')
```

## Rate Limits

- **AVI endpoints**: 100 requests/minute
- **ASR endpoints**: 10 requests/minute
- **HRP endpoints**: 20 requests/minute

## Idempotency

ASR execute requests are idempotent. Use the same `idempotencyKey` to safely retry requests:

```typescript
const key = api.generateIdempotencyKey();
// Safe to retry with same key
await api.asrExecute('tenant-id', ['vdp-123'], key);
await api.asrExecute('tenant-id', ['vdp-123'], key); // Won't create duplicate
```

## Best Practices

1. **Always use idempotency keys** for ASR requests
2. **Handle rate limits** with exponential backoff
3. **Check quarantine status** before generating content
4. **Monitor HRP findings** regularly
5. **Use batch operations** when possible

## Examples

### Complete Workflow
```typescript
// 1. Check current AI visibility
const avi = await api.aviLatest('tenant-id');

// 2. Run HRP scan to check for hallucination risks
await api.hrpScan('tenant-id');
const hrpStatus = await api.hrpStatus('tenant-id');

// 3. Generate optimization recommendations
const recommendations = await api.asrExecute(
  'tenant-id',
  ['vdp-123'],
  api.generateIdempotencyKey()
);

// 4. Resolve any quarantined topics
for (const quarantine of hrpStatus.quarantine) {
  if (quarantine.active) {
    await api.hrpResolve('tenant-id', quarantine.topic);
  }
}
```

## Support

- **Documentation**: See `openapi/dealershipai.yaml` for complete API specification
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Status**: Check API status at https://status.dealershipai.com

## Changelog

### v1.1.0
- Added HRP (Hallucination Risk Prevention) endpoints
- Enhanced ASR with competitor analysis options
- Improved error handling and timeout support
- Added batch operations for HRP resolve

### v1.0.0
- Initial release with AVI and ASR functionality
- TypeScript and Python SDKs
- Basic authentication and error handling
