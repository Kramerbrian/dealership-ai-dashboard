# Redis/Upstash Setup for DealershipAI

## Overview
The DTRI maximus system uses Redis for geographic pooling and caching to maintain 99% profit margins ($0.15 cost vs $499 revenue).

## Key Redis Patterns

### 1. Geographic Pooling Cache
```redis
# Cache AI platform results by city
SET dai:pool:naples-fl:2025-11-04 '{"chatgpt": [...], "perplexity": [...], "google_ai": [...]}'
EXPIRE dai:pool:naples-fl:2025-11-04 86400  # 24 hour TTL

# Get cached results
GET dai:pool:naples-fl:2025-11-04
```

### 2. RAR (Revenue at Risk) Metrics
```redis
# Cache RAR calculations per domain
SET dai:rar:exampledealer.com '{"monthly": 45000, "annual": 540000, "confidence": 0.87}'
EXPIRE dai:rar:exampledealer.com 3600  # 1 hour TTL
```

### 3. QAI (Quality Authority Index) Cache
```redis
SET dai:qai:exampledealer.com '{"overall": 78.5, "experience": 82, "expertise": 75, "authority": 73, "trust": 84}'
EXPIRE dai:qai:exampledealer.com 7200  # 2 hour TTL
```

### 4. E-E-A-T Scores Cache
```redis
SET dai:eeat:exampledealer.com '{"experience": {...}, "expertise": {...}, "authority": {...}, "trust": {...}}'
EXPIRE dai:eeat:exampledealer.com 7200
```

### 5. Zero-Click Daily Metrics
```redis
# Store daily zero-click rates
ZADD dai:zero-click:daily:2025-11-04 65.2 "exampledealer.com"
ZADD dai:zero-click:daily:2025-11-04 72.8 "anotherdealer.com"
```

### 6. Fix Pack Deployment Queue
```redis
# Queue fix deployments
LPUSH dai:fix-queue '{"domain": "exampledealer.com", "kind": "schema", "timestamp": 1699123456789}'
```

## Quick Test Commands

```redis
# Test connection
PING

# Set a test key
SET test:connection "OK"

# Get the test key
GET test:connection

# Check if key exists
EXISTS test:connection

# List all dai:* keys
KEYS dai:*

# Get info about Redis
INFO memory
INFO stats
```

## Environment Variables

Make sure these are set:
```bash
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## Production Checklist

- [ ] Redis connection tested
- [ ] Geographic pooling keys initialized
- [ ] Cache TTLs configured (24h for pools, 1-2h for metrics)
- [ ] Monitoring set up for cache hit rates
- [ ] Fallback strategy if Redis is unavailable

