# 🚀 Upstash CLI Quick Reference

## 🔑 Key Patterns Used in DealershipAI

### Rate Limiting Keys
```
ratelimit:ip:<IP_ADDRESS>
ratelimit:user:<USER_ID>
```

### Cache Keys
```
qai:score:<DOMAIN>
fleet:origins
rate-limit:<IDENTIFIER>
```

## 📝 Common Commands

### Check if Redis is connected
```
PING
```
Expected: `PONG`

### View all rate limit keys
```
KEYS ratelimit:*
```

### View all cache keys
```
KEYS qai:*
KEYS fleet:*
```

### Check a specific rate limit
```
GET ratelimit:ip:192.168.1.1
```

### Check QAI score cache
```
GET qai:score:exampledealer.com
```

### View key with TTL
```
TTL ratelimit:ip:192.168.1.1
PTTL ratelimit:ip:192.168.1.1  # milliseconds
```

### Clear all rate limit keys
```
EVAL "return redis.call('del', unpack(redis.call('keys', 'ratelimit:*')))" 0
```

### Clear QAI cache
```
EVAL "return redis.call('del', unpack(redis.call('keys', 'qai:*')))" 0
```

### Set a test value
```
SET test:key "Hello Upstash"
GET test:key
```

### View all keys (careful in production!)
```
KEYS *
```

### Check memory usage
```
INFO memory
```

## 🔍 Debugging Commands

### Check if key exists
```
EXISTS ratelimit:ip:192.168.1.1
```

### View key type
```
TYPE qai:score:exampledealer.com
```

### Get value with expiry info
```
GET ratelimit:ip:192.168.1.1
TTL ratelimit:ip:192.168.1.1
```

## 🧪 Testing Rate Limiting

### Simulate rate limit increment
```
INCR ratelimit:test:user123
PEXPIRE ratelimit:test:user123 60000  # 1 minute
GET ratelimit:test:user123
```

### Check current count
```
GET ratelimit:test:user123
```

## 📊 Environment Variables Reference

Your app expects:
- `UPSTASH_REDIS_REST_URL` - REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - REST API token

### Test from CLI
```bash
# In terminal (not Upstash CLI)
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

## 🎯 Quick Test Workflow

1. **Test connection:**
   ```
   PING
   ```

2. **Set a test cache:**
   ```
   SET qai:score:test.com '{"value":87,"delta":3}'
   GET qai:score:test.com
   ```

3. **Set TTL (3 minutes):**
   ```
   SETEX qai:score:test.com 180 '{"value":87}'
   ```

4. **Check TTL:**
   ```
   TTL qai:score:test.com
   ```

5. **Delete test key:**
   ```
   DEL qai:score:test.com
   ```

## ⚠️ Production Notes

- Use `KEYS *` sparingly (it's O(N))
- Use `SCAN` for large datasets
- Always set TTL on cache keys
- Monitor memory usage with `INFO memory`

## 🔗 Related Files

- `lib/redis.ts` - Redis client setup
- `lib/rate-limit.ts` - Rate limiting logic
- `lib/security/rate-limit.ts` - Security rate limiting

## 💡 Tips

1. **Find keys by pattern:**
   ```
   KEYS ratelimit:*
   ```

2. **Count keys:**
   ```
   EVAL "return #redis.call('keys', 'ratelimit:*')" 0
   ```

3. **Clear expired keys:**
   ```
   # Upstash handles this automatically
   # But you can check with:
   TTL <key>
   # Returns -2 if key doesn't exist
   # Returns -1 if key exists but has no expiry
   ```

