# ✅ Redis Idempotency Integration - Bulk CSV Upload

## 🎯 What Was Added

### 1. **File-Level Idempotency** (`/api/origins/bulk-csv`)
- ✅ Checks Redis for duplicate file uploads using SHA256 checksum
- ✅ Prevents same file from being uploaded multiple times
- ✅ Caches upload metadata after successful preview
- ✅ Allows re-upload after 24 hours or from different tenant
- ✅ Returns 409 Conflict with existing upload details if duplicate

### 2. **Commit-Level Idempotency** (`/api/origins/bulk-csv/commit`)
- ✅ Checks Redis for duplicate commit requests using idempotency key
- ✅ Returns cached results for duplicate commits (true idempotency)
- ✅ Caches successful commits for 48 hours
- ✅ Prevents duplicate writes to Fleet API

## 🔑 Redis Key Patterns

### File Checksum Cache:
```
bulk:checksum:<SHA256_FILE_CHECKSUM>
```

**Value Structure:**
```json
{
  "uploadId": "abc123...",
  "timestamp": 1234567890,
  "tenantId": "tenant-001",
  "rowsCount": 42
}
```

**TTL:** 24 hours (86400 seconds)

### Commit Idempotency Cache:
```
bulk:commit:<IDEMPOTENCY_KEY>
```

**Value Structure:**
```json
{
  "results": [...],
  "timestamp": 1234567890
}
```

**TTL:** 48 hours (172800 seconds)

## 🔄 Flow Diagram

```
1. Upload CSV
   ↓
2. Compute SHA256 checksum
   ↓
3. Check Redis: bulk:checksum:<checksum>
   ↓
4a. If exists & same tenant & < 24h → Return 409 Conflict
4b. If not exists or expired → Proceed with parsing
   ↓
5. Parse & validate CSV
   ↓
6. Cache checksum in Redis (24h TTL)
   ↓
7. Return preview with uploadId
   ↓
8. User clicks "Commit"
   ↓
9. Generate idempotency key from row checksums
   ↓
10. Check Redis: bulk:commit:<idempotencyKey>
    ↓
11a. If exists → Return cached results (idempotent)
11b. If not exists → Proceed with Fleet API call
    ↓
12. Call Fleet API
    ↓
13. Cache results in Redis (48h TTL)
    ↓
14. Return results
```

## 🧪 Testing

### Test Duplicate Upload Detection:

```bash
# 1. Upload CSV file
curl -X POST http://localhost:3000/api/origins/bulk-csv \
  -F "file=@test.csv" \
  -H "Authorization: Bearer $TOKEN"

# 2. Check Redis (in Upstash CLI):
KEYS bulk:checksum:*
GET bulk:checksum:<checksum>

# 3. Try uploading same file again
# Should return 409 Conflict
```

### Test Commit Idempotency:

```bash
# 1. Commit upload
curl -X POST http://localhost:3000/api/origins/bulk-csv/commit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"rows": [...]}'

# 2. Check Redis:
KEYS bulk:commit:*
GET bulk:commit:<idempotencyKey>

# 3. Retry same commit (should return cached result)
# Should return same results with cached: true
```

## 📊 Monitoring Keys

### View All Bulk Upload Keys:
```redis
KEYS bulk:*
```

### Count by Type:
```redis
EVAL "return #redis.call('keys', 'bulk:checksum:*')" 0
EVAL "return #redis.call('keys', 'bulk:commit:*')" 0
```

### Check TTL:
```redis
TTL bulk:checksum:<checksum>
TTL bulk:commit:<idempotencyKey>
```

### View Cached Data:
```redis
GET bulk:checksum:<checksum>
GET bulk:commit:<idempotencyKey>
```

## 🔧 Configuration

### TTL Values:
- **File Checksum:** 24 hours (86400 seconds)
  - Prevents duplicate uploads within 24h from same tenant
  - Allows re-upload after expiration or from different tenant

- **Commit Cache:** 48 hours (172800 seconds)
  - Longer TTL for commit results (write operations)
  - Allows retries without duplicate API calls

### Graceful Degradation:
- If Redis is unavailable, the routes continue to work
- Only idempotency protection is lost (no duplicate detection)
- All other functionality remains intact

## ✅ Benefits

1. **Prevents Duplicate Uploads:** Same file can't be uploaded twice within 24h
2. **Idempotent Commits:** Retry-safe commit operations
3. **Performance:** Cached results reduce Fleet API calls
4. **User Experience:** Clear error messages for duplicate uploads
5. **Cost Savings:** Reduces unnecessary API calls and processing

## 🚀 Production Checklist

- [x] Redis idempotency checks added
- [x] File checksum caching (24h TTL)
- [x] Commit result caching (48h TTL)
- [x] Graceful degradation (works without Redis)
- [x] Clear error messages for duplicates
- [x] Cache key patterns documented
- [x] Testing commands provided

## 📝 Notes

- Checksums use SHA256 for files, SHA1 for rows
- Different tenants can upload same file (different cache keys)
- Expired cache entries allow re-upload (24h window)
- Commit cache prevents duplicate Fleet API calls on retries

