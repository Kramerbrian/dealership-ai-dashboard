# DealershipAI API Documentation

## Overview

DealershipAI provides a comprehensive REST API for managing dealership data, AI visibility scores, and analytics.

## Base URL

- **Production**: `https://api.dealershipai.com`
- **Development**: `http://localhost:3000`

## Authentication

All protected endpoints require Clerk authentication. Include the session token in requests.

```typescript
headers: {
  'Authorization': `Bearer ${sessionToken}`
}
```

## Endpoints

### `/api/analyze`

Analyzes a domain by combining GMB, schema, and reviews scores.

**Method**: `GET`

**Query Parameters**:
- `domain` (required): Domain to analyze (e.g., `example.com`)

**Response**:
```json
{
  "score": 75,
  "breakdown": {
    "gmb": 80,
    "schema": 70,
    "reviews": 75
  },
  "domain": "example.com",
  "timestamp": "2025-01-31T12:00:00Z"
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid domain parameter
- `401`: Unauthorized
- `500`: Internal server error

---

### `/api/orchestrator`

AI Orchestrator endpoint for cognitive operations.

**Method**: `POST`

**Request Body**:
```json
{
  "action": "analyze_visibility",
  "dealerId": "dealer_123",
  "domain": "example.com",
  "context": {}
}
```

**Actions**:
- `analyze_visibility`: Multi-model AI platform scan
- `compute_qai`: Quality Authority Index calculation
- `calculate_oci`: Opportunity Cost of Inaction
- `generate_asr`: Autonomous Strategy Recommendations
- `analyze_ugc`: Cross-platform sentiment analysis

**Response**:
```json
{
  "success": true,
  "result": {},
  "confidence": 0.85,
  "traceId": "trace_123"
}
```

---

### `/api/pulse/digest`

Get or create daily Pulse digests.

**Method**: `GET` | `POST`

**GET Query Parameters**:
- `tenant`: Tenant ID (optional, defaults to user ID)
- `date`: Date in YYYY-MM-DD format (optional, defaults to today)

**POST Request Body**:
```json
{
  "tenant": "tenant_123",
  "as_of": "2025-01-31",
  "topics": [
    {
      "title": "Schema Update",
      "summary": "Schema coverage improved",
      "context": "Additional context",
      "actions": ["Action 1", "Action 2"]
    }
  ]
}
```

---

### `/api/web-vitals`

Core Web Vitals tracking endpoint.

**Method**: `GET` | `POST`

**GET**: Retrieve Web Vitals data for a tenant

**POST**: Report Web Vitals metrics
```json
{
  "lcp": 2.5,
  "cls": 0.1,
  "inp": 200,
  "fcp": 1.8,
  "ttfb": 500
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed message (development only)"
}
```

## Rate Limiting

- **Default**: 60 requests per minute per IP
- **Burst**: 20 requests
- **Daily Limit**: 200,000 requests

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response**:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Webhooks

Webhook endpoints require HMAC signature verification.

**Header**: `X-Webhook-Signature`

**Verification**: SHA-256 HMAC of request body using shared secret

---

## SDK Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('https://api.dealershipai.com/api/analyze?domain=example.com', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### cURL

```bash
curl -X GET "https://api.dealershipai.com/api/analyze?domain=example.com" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Support

For API support, contact: api@dealershipai.com


## Base URL

**Production**: `https://api.dealershipai.com`  
**Development**: `http://localhost:3000`

---

## Authentication

All protected endpoints require Clerk authentication via Bearer token or session cookie.

```bash
# Using Bearer token
Authorization: Bearer <clerk_session_token>
```

---

## Endpoints

### 1. Analyze Domain

**GET** `/api/analyze`

Analyzes a domain by combining Google My Business, schema markup, and reviews scores.

**Query Parameters:**
- `domain` (required): Domain to analyze (e.g., `example.com`)

**Response:**
```json
{
  "score": 75,
  "breakdown": {
    "gmb": 80,
    "schema": 70,
    "reviews": 75
  },
  "domain": "example.com",
  "timestamp": "2025-01-31T12:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid domain or missing parameter
- `401`: Unauthorized
- `500`: Internal server error

---

### 2. Orchestrator

**POST** `/api/orchestrator`

Execute orchestrator actions (AI CSO operations).

**Request Body:**
```json
{
  "action": "analyze_visibility" | "compute_qai" | "calculate_oci" | "generate_asr" | "analyze_ugc",
  "dealerId": "string",
  "domain": "string (optional)",
  "context": {},
  "parameters": {}
}
```

**Response:**
```json
{
  "success": true,
  "result": {},
  "confidence": 0.85,
  "rationale": "string",
  "traceId": "string"
}
```

**Headers:**
- `X-Orchestrator-Role: AI_CSO`
- `X-Trace-Id: <trace_id>`

---

### 3. Pulse Digest

**GET** `/api/pulse/digest`

Get daily pulse digest for a tenant.

**Query Parameters:**
- `tenant` (optional): Tenant ID (defaults to authenticated user)
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "as_of": "2025-01-31T00:00:00Z",
  "topics": [
    {
      "title": "Schema Coverage Improved",
      "summary": "Your schema coverage increased by 15%",
      "context": "Additional details...",
      "actions": ["Action 1", "Action 2"]
    }
  ]
}
```

---

### 4. Web Vitals

**GET** `/api/web-vitals`

Get Core Web Vitals metrics.

**POST** `/api/web-vitals`

Report client-side Web Vitals.

**Request Body:**
```json
{
  "name": "LCP" | "CLS" | "INP" | "FCP" | "TTFB",
  "value": 1234,
  "id": "metric-id",
  "delta": 100,
  "rating": "good" | "needs-improvement" | "poor"
}
```

---

### 5. Health Check

**GET** `/api/health`

Check system health and service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-31T12:00:00Z",
  "services": {
    "database": { "status": "healthy", "latency": 45 },
    "redis": { "status": "healthy", "latency": 12 },
    "openai": { "status": "healthy", "latency": 234 }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed message (development only)"
}
```

**Common Status Codes:**
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

---

## Rate Limiting

- **Default**: 60 requests per minute per user
- **Burst**: 20 requests per 10 seconds
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Webhooks

### Marketplace Sync

**POST** `/api/webhooks/marketplace-sync`

Receives marketplace citation updates from Pulse/ATI/CIS.

**Headers:**
- `X-Webhook-Secret`: Webhook secret for verification

**Request Body:**
```json
{
  "source": "pulse" | "ati" | "cis",
  "tenantId": "string",
  "data": []
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Analyze domain
const response = await fetch('/api/analyze?domain=example.com', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### cURL

```bash
curl -X GET "https://api.dealershipai.com/api/analyze?domain=example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changelog

### v1.0.0 (2025-01-31)
- Initial API release
- Analyze endpoint
- Orchestrator integration
- Pulse digest framework
- Web Vitals tracking

