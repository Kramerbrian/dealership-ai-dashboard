# 🧪 Upstash Redis Test Commands

## Quick Test Script

Run this from your terminal (not Upstash CLI):

```bash
node scripts/test-redis-connection.js
```

This will:
1. ✅ Test PING
2. ✅ Test SET/GET
3. ✅ Test QAI cache pattern
4. ✅ Test rate limit pattern
5. ✅ Test fleet cache pattern
6. ✅ List existing keys
7. ✅ Clean up test keys

## Manual CLI Testing

### In Upstash CLI:

```redis
# 1. Test connection
PING

# 2. Test QAI cache
SET qai:score:exampledealer.com '{"value":87,"delta":3,"factors":[]}'
GET qai:score:exampledealer.com
TTL qai:score:exampledealer.com

# 3. Test fleet cache
SET fleet:origins '{"origins":[{"id":"1","origin":"https://example.com"}]}'
GET fleet:origins

# 4. Test rate limiting
INCR ratelimit:ip:192.168.1.1
GET ratelimit:ip:192.168.1.1
PEXPIRE ratelimit:ip:192.168.1.1 60000

# 5. View all keys
KEYS *

# 6. View specific patterns
KEYS qai:*
KEYS fleet:*
KEYS ratelimit:*

# 7. Check memory
INFO memory

# 8. Clean up test keys
DEL qai:score:exampledealer.com
DEL fleet:origins
DEL ratelimit:ip:192.168.1.1
```

## Integration Testing

### Test QAI Cache from API:

```bash
# Set cache
curl -X POST "http://localhost:3000/api/metrics/qai?domain=test.com"

# Check if cached (will be in Redis)
# Then in Upstash CLI:
GET qai:score:test.com
```

### Test Rate Limiting:

```bash
# Make multiple requests (will create rate limit keys)
for i in {1..5}; do
  curl http://localhost:3000/api/origins
done

# Check in Upstash CLI:
KEYS ratelimit:*
GET ratelimit:ip:127.0.0.1
```

## Monitoring Keys

### Count keys by pattern:
```redis
EVAL "return #redis.call('keys', 'qai:*')" 0
EVAL "return #redis.call('keys', 'ratelimit:*')" 0
EVAL "return #redis.call('keys', 'fleet:*')" 0
```

### View keys with TTL:
```redis
# Get all rate limit keys with their TTL
KEYS ratelimit:*
# Then for each key:
TTL ratelimit:ip:192.168.1.1
```

## Production Checks

### Health Check:
```redis
PING
INFO memory
INFO stats
```

### Key Expiration Check:
```redis
# Check if keys are expiring properly
TTL qai:score:test.com
# Returns:
# -2 = key doesn't exist
# -1 = key exists but has no expiry
# >0 = seconds until expiry
```

