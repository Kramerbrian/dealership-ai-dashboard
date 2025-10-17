# Redis Production Setup Guide

## 🚀 Quick Setup Options

### Option 1: Upstash Redis (Recommended for Vercel)

1. **Sign up for Upstash**:
   - Go to [console.upstash.com](https://console.upstash.com)
   - Create a new account or sign in

2. **Create Redis Database**:
   - Click "Create Database"
   - Choose "Global" for multi-region
   - Select "Global" region for best performance
   - Name: `dealershipai-production`

3. **Get Connection Details**:
   - Copy the `UPSTASH_REDIS_REST_URL`
   - Copy the `UPSTASH_REDIS_REST_TOKEN`

4. **Add to Vercel Environment Variables**:
   ```bash
   vercel env add REDIS_URL
   # Paste: redis://default:YOUR_TOKEN@YOUR_ENDPOINT:6380
   
   vercel env add KV_URL
   # Paste: redis://default:YOUR_TOKEN@YOUR_ENDPOINT:6380
   ```

### Option 2: Redis Cloud

1. **Sign up for Redis Cloud**:
   - Go to [redis.com/try-free](https://redis.com/try-free)
   - Create a free account

2. **Create Database**:
   - Click "New Database"
   - Choose "Fixed" for production
   - Select region closest to your users
   - Name: `dealershipai-prod`

3. **Get Connection String**:
   - Copy the connection string from the database details
   - Format: `redis://default:password@host:port`

### Option 3: Self-Hosted Redis

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install redis-server
   
   # macOS
   brew install redis
   
   # Docker
   docker run -d --name redis -p 6379:6379 redis:alpine
   ```

2. **Configure Redis**:
   ```bash
   # Edit redis.conf
   sudo nano /etc/redis/redis.conf
   
   # Set password
   requirepass your-secure-password
   
   # Enable persistence
   save 900 1
   save 300 10
   save 60 10000
   
   # Restart Redis
   sudo systemctl restart redis-server
   ```

## 🔧 Production Configuration

### Redis Configuration for Production

```conf
# redis.conf
# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your-secure-password
rename-command FLUSHDB ""
rename-command FLUSHALL ""

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Network
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 300
```

### Environment Variables

Add these to your Vercel project:

```bash
# Redis Connection
REDIS_URL=redis://default:password@host:port
KV_URL=redis://default:password@host:port

# Redis Configuration
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

## 📊 Monitoring Redis

### Health Check Endpoint

The system includes a Redis health check at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

### Redis Monitoring Commands

```bash
# Check Redis status
redis-cli ping

# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# Check connected clients
redis-cli client list

# Check slow queries
redis-cli slowlog get 10
```

### Upstash Monitoring

If using Upstash:
1. Go to your database dashboard
2. Check "Metrics" tab for:
   - Memory usage
   - Commands per second
   - Hit ratio
   - Connected clients

## 🚦 Rate Limiting Configuration

The system includes multiple rate limiters:

### API Rate Limiter
- **Limit**: 1000 requests/minute per tenant
- **Window**: 60 seconds
- **Key Pattern**: `rate_limit:api:{tenant_id}`

### Webhook Rate Limiter
- **Limit**: 100 requests/minute per tenant
- **Window**: 60 seconds
- **Key Pattern**: `rate_limit:webhook:{tenant_id}`

### Tenant Rate Limiter
- **Limit**: 10,000 requests/hour per tenant
- **Window**: 3600 seconds
- **Key Pattern**: `rate_limit:tenant:{tenant_id}`

### Token Bucket
- **Capacity**: 100 tokens
- **Refill Rate**: 10 tokens/second
- **Key Pattern**: `token_bucket:{tenant_id}`

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**:
   ```bash
   # Check if Redis is running
   sudo systemctl status redis-server
   
   # Start Redis
   sudo systemctl start redis-server
   ```

2. **Authentication Failed**:
   ```bash
   # Test connection with password
   redis-cli -a your-password ping
   ```

3. **Memory Issues**:
   ```bash
   # Check memory usage
   redis-cli info memory
   
   # Clear all keys (use with caution)
   redis-cli flushall
   ```

4. **Slow Performance**:
   ```bash
   # Check slow queries
   redis-cli slowlog get 10
   
   # Check connected clients
   redis-cli client list
   ```

### Performance Optimization

1. **Enable Redis Persistence**:
   ```conf
   save 900 1
   save 300 10
   save 60 10000
   ```

2. **Configure Memory Policy**:
   ```conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

3. **Monitor Hit Ratio**:
   ```bash
   redis-cli info stats | grep keyspace
   ```

## 🚀 Next Steps

1. **Choose your Redis provider** (Upstash recommended for Vercel)
2. **Set up the database** with the configuration above
3. **Add environment variables** to Vercel
4. **Test the connection** using the health check endpoint
5. **Monitor performance** using the provided tools

Your DealershipAI system will automatically use Redis for:
- Rate limiting API requests
- Caching frequently accessed data
- Storing idempotency keys
- Session management
- Real-time analytics
