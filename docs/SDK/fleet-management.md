# Fleet Management SDK

Manage 5,000+ dealership rooftops with bulk operations and automated scanning.

---

## Register Dealers

### Bulk Registration (JSON)

```typescript
// TypeScript
const result = await client.origins.bulk({
  origins: [
    'https://dealer1.com',
    'https://dealer2.com',
    'https://dealer3.com'
  ]
});

console.log(`Registered: ${result.registered} dealers`);
console.log(`Queued: ${result.queued} refresh jobs`);
```

```python
# Python
result = client.origins.bulk(origins=[
    'https://dealer1.com',
    'https://dealer2.com',
    'https://dealer3.com'
])

print(f"Registered: {result.registered} dealers")
print(f"Queued: {result.queued} refresh jobs")
```

```bash
# cURL
curl -X POST https://api.dealershipai.com/api/origins/bulk \
  -H "Authorization: Bearer $DEALERSHIPAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "origins": [
      "https://dealer1.com",
      "https://dealer2.com",
      "https://dealer3.com"
    ]
  }'
```

### Bulk Registration (CSV)

```typescript
// TypeScript
const formData = new FormData();
formData.append('file', csvFile);

const result = await client.origins.bulkCSV(formData);
```

```python
# Python
with open('dealers.csv', 'rb') as f:
    result = client.origins.bulk_csv(file=f)
```

```bash
# cURL
curl -X POST https://api.dealershipai.com/api/origins/bulk-csv \
  -H "Authorization: Bearer $DEALERSHIPAI_API_KEY" \
  -F "file=@dealers.csv"
```

**CSV Format:**
```csv
origin,name,city,state,email
https://dealer1.com,Dealer One,Miami,FL,contact@dealer1.com
https://dealer2.com,Dealer Two,Atlanta,GA,contact@dealer2.com
```

---

## List Dealers

### Get All Dealers (Paginated)

```typescript
// TypeScript
const dealers = await client.origins.list({
  page: 1,
  limit: 50,
  city: 'Miami',
  state: 'FL'
});

dealers.origins.forEach(dealer => {
  console.log(`${dealer.domain}: ${dealer.lastScore?.aiVisibility}%`);
});
```

```python
# Python
dealers = client.origins.list(
    page=1,
    limit=50,
    city='Miami',
    state='FL'
)

for dealer in dealers.origins:
    print(f"{dealer.domain}: {dealer.last_score.ai_visibility}%")
```

```bash
# cURL
curl "https://api.dealershipai.com/api/origins?page=1&limit=50&city=Miami&state=FL" \
  -H "Authorization: Bearer $DEALERSHIPAI_API_KEY"
```

**Response:**
```json
{
  "origins": [
    {
      "id": "dealer-123",
      "domain": "dealer1.com",
      "name": "Dealer One",
      "city": "Miami",
      "state": "FL",
      "lastScore": {
        "aiVisibility": 87.5,
        "zeroClick": 72.3,
        "ugcHealth": 84.1,
        "createdAt": "2025-01-02T10:30:00Z"
      },
      "lastAudit": {
        "status": "completed",
        "createdAt": "2025-01-02T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5234,
    "totalPages": 105
  }
}
```

---

## Run AI Visibility Scans

### Single Dealer Scan

```typescript
// TypeScript
const scan = await client.aiScores.get({
  origin: 'https://dealer1.com'
});

console.log('Platform Visibility:');
console.log(`  Google: ${scan.platformVisibility.google}%`);
console.log(`  ChatGPT: ${scan.platformVisibility.chatgpt}%`);
console.log(`  Perplexity: ${scan.platformVisibility.perplexity}%`);
console.log(`  Claude: ${scan.platformVisibility.claude}%`);
```

```python
# Python
scan = client.ai_scores.get(origin='https://dealer1.com')

print('Platform Visibility:')
print(f"  Google: {scan.platform_visibility.google}%")
print(f"  ChatGPT: {scan.platform_visibility.chatgpt}%")
print(f"  Perplexity: {scan.platform_visibility.perplexity}%")
print(f"  Claude: {scan.platform_visibility.claude}%")
```

---

## Trigger Refresh

### Manual Refresh

```typescript
// TypeScript
const refresh = await client.refresh.trigger({
  origin: 'https://dealer1.com'
});

console.log(`Audit ID: ${refresh.auditId}`);
console.log(`Status: ${refresh.status}`);
```

```python
# Python
refresh = client.refresh.trigger(origin='https://dealer1.com')

print(f"Audit ID: {refresh.audit_id}")
print(f"Status: {refresh.status}")
```

```bash
# cURL
curl -X POST "https://api.dealershipai.com/api/refresh?origin=https://dealer1.com" \
  -H "Authorization: Bearer $DEALERSHIPAI_API_KEY"
```

---

## Get Status

### System-Wide Status

```typescript
// TypeScript
const status = await client.status.get();

console.log(`Total Origins: ${status.system.totalOrigins}`);
console.log(`Pending Audits: ${status.system.audits.pending}`);
console.log(`Completed: ${status.system.audits.completed}`);
```

```python
# Python
status = client.status.get()

print(f"Total Origins: {status.system.total_origins}")
print(f"Pending Audits: {status.system.audits.pending}")
print(f"Completed: {status.system.audits.completed}")
```

### Single Dealer Status

```typescript
// TypeScript
const dealerStatus = await client.status.get({
  origin: 'https://dealer1.com'
});

console.log(`Latest Score: ${dealerStatus.latestScore?.aiVisibility}%`);
console.log(`Recent Audits: ${dealerStatus.recentAudits.length}`);
```

---

## Scheduled Refresh

The system automatically refreshes all dealers 3x daily (8am, 12pm, 4pm ET). You can also trigger refresh manually or via cron jobs.

**Cron Endpoint**: `/api/cron/fleet-refresh`  
**Authentication**: `Authorization: Bearer $CRON_SECRET`

---

## Bulk Operations

### Export to CSV

```typescript
// TypeScript
const csv = await client.origins.exportCSV({
  filters: { city: 'Miami', state: 'FL' }
});

// Save to file
fs.writeFileSync('dealers.csv', csv);
```

### Bulk Refresh Selected

```typescript
// TypeScript
const dealerIds = ['dealer-1', 'dealer-2', 'dealer-3'];
const results = await Promise.all(
  dealerIds.map(id => client.refresh.trigger({ dealerId: id }))
);
```

---

## Error Handling

```typescript
// TypeScript
try {
  const result = await client.origins.bulk({ origins: [...] });
} catch (error) {
  if (error.status === 400) {
    console.error('Invalid request:', error.message);
  } else if (error.status === 401) {
    console.error('Authentication failed');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
    console.log(`Retry after: ${error.retryAfter} seconds`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

```python
# Python
try:
    result = client.origins.bulk(origins=[...])
except DealershipAIError as e:
    if e.status_code == 400:
        print(f"Invalid request: {e.message}")
    elif e.status_code == 401:
        print("Authentication failed")
    elif e.status_code == 429:
        print(f"Rate limit exceeded. Retry after: {e.retry_after} seconds")
    else:
        print(f"Unexpected error: {e}")
```

---

## Rate Limits

- **Standard**: 100 requests/minute per API key
- **Bulk Operations**: 10 requests/minute
- **Enterprise**: Higher limits available

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

