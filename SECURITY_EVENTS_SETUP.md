# 🔒 Security Events Setup - DealershipAI v2.0

## Overview
The `security_events` table provides comprehensive security logging with Row Level Security (RLS) for DealershipAI v2.0. This ensures all user actions and system events are properly tracked and secured.

## 🚀 Quick Setup

### 1. Run the Diagnostic
```bash
# Check current status
psql $DATABASE_URL -f scripts/check-security-events.sql
```

### 2. Set up Security Events
```bash
# Run the setup script
./scripts/setup-security-events.sh
```

### 3. Manual Setup (if needed)
```sql
-- Run the migration directly
psql $DATABASE_URL -f prisma/migrations/001_security_events.sql
```

## 📊 Diagnostic Results

The diagnostic will show one of these statuses:

| Status | Meaning | Action Required |
|--------|---------|----------------|
| ✅ Table exists, RLS enabled, policies configured | Ready to use | None |
| ⚠️ Table exists but RLS disabled | Enable RLS | Run migration |
| ⚠️ Table exists, RLS enabled, but no policies | Add policies | Run migration |
| ❌ Table missing - run migration | Create table | Run migration |

## 🏗️ Table Structure

```sql
CREATE TABLE public.security_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,           -- Type of event (auth.login, api.access, etc.)
  actor_id uuid NOT NULL,             -- User who performed the action
  payload jsonb NOT NULL,             -- Event details in JSON
  occurred_at timestamptz NOT NULL DEFAULT now()
);
```

## 🔐 RLS Policies

### For Authenticated Users
- **SELECT**: Can read all security events (for monitoring)
- **INSERT**: Can insert new security events (for logging)

### Policy Details
```sql
-- Read access for authenticated users
CREATE POLICY "Auth select security_events"
ON public.security_events FOR SELECT TO authenticated USING (true);

-- Write access for authenticated users
CREATE POLICY "Auth insert security_events"
ON public.security_events FOR INSERT TO authenticated WITH CHECK (true);
```

## 📝 Usage Examples

### TypeScript Integration
```typescript
import { SecurityLogger } from '@/lib/security-logger';

// Log authentication events
await SecurityLogger.logAuthEvent('user-123', 'login', {
  userAgent: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1',
  success: true
});

// Log API access
await SecurityLogger.logApiEvent('user-123', '/api/analyze', 'POST', {
  responseTime: 150,
  statusCode: 200,
  cost: 0.0125
});

// Log tier limit events
await SecurityLogger.logTierLimitEvent('user-123', 'PRO', 50, 50, {
  endpoint: '/api/analyze',
  upgradeRecommended: true
});
```

### Event Types
- `auth.login` - User login
- `auth.logout` - User logout
- `auth.register` - User registration
- `api.access` - API endpoint access
- `tier.limit_reached` - Session limit reached
- `scoring.calculated` - AI scoring completed
- `geo_pool.cache_hit` - Geographic pooling event
- `payment.processed` - Payment processing

## 🔍 Monitoring Queries

### Recent Events
```sql
SELECT event_type, actor_id, payload, occurred_at
FROM public.security_events
ORDER BY occurred_at DESC
LIMIT 100;
```

### Events by User
```sql
SELECT event_type, payload, occurred_at
FROM public.security_events
WHERE actor_id = 'user-uuid-here'
ORDER BY occurred_at DESC;
```

### API Usage Stats
```sql
SELECT 
  COUNT(*) as total_requests,
  COUNT(DISTINCT actor_id) as unique_users,
  AVG((payload->>'responseTime')::numeric) as avg_response_time
FROM public.security_events
WHERE event_type = 'api.access'
  AND occurred_at >= NOW() - INTERVAL '24 hours';
```

## 🚨 Security Considerations

### Data Privacy
- All events are logged with user consent
- Sensitive data should be hashed or excluded from payload
- Regular cleanup of old events (recommended: 90 days)

### Performance
- Indexes are created for common query patterns
- Consider partitioning for high-volume deployments
- Monitor query performance and add indexes as needed

### Compliance
- GDPR: Users can request their event data
- SOX: Financial events are logged for audit trails
- HIPAA: Healthcare-related events should be encrypted

## 🔧 Maintenance

### Cleanup Old Events
```sql
-- Delete events older than 90 days
DELETE FROM public.security_events
WHERE occurred_at < NOW() - INTERVAL '90 days';
```

### Add Custom Indexes
```sql
-- For specific query patterns
CREATE INDEX idx_security_events_payload_gin ON public.security_events USING gin(payload);
CREATE INDEX idx_security_events_type_time ON public.security_events(event_type, occurred_at);
```

### Monitor Table Size
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename = 'security_events';
```

## ✅ Verification Checklist

- [ ] Table exists in database
- [ ] RLS is enabled
- [ ] Policies are created
- [ ] Indexes are present
- [ ] TypeScript logger works
- [ ] Events are being logged
- [ ] Queries return expected results

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure user has authenticated role
   - Check RLS policies are correct

2. **Table Not Found**
   - Run the migration script
   - Check database connection

3. **RLS Not Working**
   - Verify policies exist
   - Check user authentication status

4. **Performance Issues**
   - Add appropriate indexes
   - Consider table partitioning
   - Monitor query execution plans

## 📞 Support

If you encounter issues:
1. Check the diagnostic output
2. Review the error logs
3. Verify database permissions
4. Test with a simple query first

The security events system is now ready for DealershipAI v2.0! 🚀