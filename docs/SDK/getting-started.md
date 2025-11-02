# DealershipAI SDK — Getting Started

**Version 1.0** | Last Updated: 2025-01-03

---

## Overview

The DealershipAI SDK provides programmatic access to AI visibility analytics, autonomous trust optimization, and fleet management capabilities. Use it to integrate Trust Score tracking, automated fixes, and ROI attribution into your applications.

---

## Quick Start

### Installation

#### JavaScript/TypeScript (Node.js)
```bash
npm install @dealershipai/sdk
# or
yarn add @dealershipai/sdk
```

#### Python
```bash
pip install dealershipai-sdk
```

#### cURL
```bash
# No installation needed - direct API access
```

---

## Authentication

All API requests require authentication via Bearer token or API key.

### API Key Authentication

```typescript
import { DealershipAI } from '@dealershipai/sdk';

const client = new DealershipAI({
  apiKey: process.env.DEALERSHIPAI_API_KEY,
  baseUrl: 'https://api.dealershipai.com'
});
```

```python
from dealershipai import DealershipAI

client = DealershipAI(
    api_key=os.getenv('DEALERSHIPAI_API_KEY'),
    base_url='https://api.dealershipai.com'
)
```

```bash
# cURL
curl -H "Authorization: Bearer $DEALERSHIPAI_API_KEY" \
     https://api.dealershipai.com/api/origins
```

---

## Your First Request

### Get AI Visibility Scores

```typescript
// TypeScript/JavaScript
const scores = await client.aiScores.get({
  origin: 'https://www.yourdealership.com'
});

console.log(`AI Visibility: ${scores.aiVisibility}%`);
console.log(`Zero-Click: ${scores.zeroClick}%`);
console.log(`Platform Visibility:`, scores.platformVisibility);
```

```python
# Python
scores = client.ai_scores.get(origin='https://www.yourdealership.com')

print(f"AI Visibility: {scores.ai_visibility}%")
print(f"Zero-Click: {scores.zero_click}%")
print(f"Platform Visibility: {scores.platform_visibility}")
```

```bash
# cURL
curl "https://api.dealershipai.com/api/ai-scores?origin=https://www.yourdealership.com" \
  -H "Authorization: Bearer $DEALERSHIPAI_API_KEY"
```

---

## Core Concepts

### Dealer Origins
A "dealer origin" is the root domain of a dealership website. Register origins to track and optimize their AI visibility.

### Trust Scores
Three primary metrics:
- **AI Visibility** (0-100): Overall visibility across AI platforms
- **Zero-Click** (0-100): Percentage of pages with FAQ/HowTo schema
- **UGC Health** (0-100): Review quality and response rate

### Autonomous Trust Engine
The system automatically detects, diagnoses, decides, deploys, and verifies fixes. You can trigger it manually or let it run on schedule.

---

## Next Steps

- [Fleet Management](./fleet-management.md) — Bulk operations for 5,000+ rooftops
- [Trust Engine](./trust-engine.md) — Autonomous optimization
- [Revenue Attribution](./revenue-attribution.md) — ROI tracking
- [Webhooks](./webhooks.md) — Real-time notifications
- [API Reference](./api-reference.md) — Complete endpoint documentation

---

## Support

- **Documentation**: [docs.dealershipai.com](https://docs.dealershipai.com)
- **API Status**: [status.dealershipai.com](https://status.dealershipai.com)
- **Support**: support@dealershipai.com

