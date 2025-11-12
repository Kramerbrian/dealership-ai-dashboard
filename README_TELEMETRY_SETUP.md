# Telemetry Setup Guide

This guide explains how to set up the telemetry system for DealershipAI.

## Database Setup

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL from `supabase/migrations/001_telemetry_events.sql`
4. Click **Run** to execute

### Option 2: Using Migration File

The migration file is located at:
```
supabase/migrations/001_telemetry_events.sql
```

You can run this using Supabase CLI or copy the SQL into the SQL Editor.

### Option 3: Check Setup Status

You can check if the table exists by calling:

```bash
# GET request to check status
curl http://localhost:3000/api/admin/setup

# Response will show if table exists and event count
```

## SQL Schema

```sql
CREATE TABLE IF NOT EXISTS telemetry_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB,
  ts BIGINT,
  ip TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes Created

The migration also creates indexes for performance:

- `idx_telemetry_events_type` - For filtering by event type
- `idx_telemetry_events_ts` - For time-based queries
- `idx_telemetry_events_created_at` - For date-based queries

## Row Level Security (RLS)

The table has RLS enabled with policies for:
- Service role can insert (for API writes)
- Service role can read (for admin dashboard)

## Testing the Setup

### 1. Check Table Status

```bash
curl http://localhost:3000/api/admin/setup
```

### 2. Send a Test Event

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "type": "page_view",
    "payload": {"page": "/landing"},
    "ts": 1234567890
  }'
```

### 3. Retrieve Events

```bash
curl http://localhost:3000/api/telemetry
```

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

## Admin Dashboard

Once set up, you can view analytics at:
- `/admin` - Admin analytics dashboard with charts and CSV export

## Troubleshooting

### Table doesn't exist error

If you get a "table doesn't exist" error:

1. Check that you've run the migration SQL in Supabase
2. Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
3. Check the Supabase dashboard to confirm the table exists

### Rate limiting

Telemetry endpoint is rate-limited to 30 requests per minute per IP. If you hit the limit:
- Wait 60 seconds
- The rate limit resets automatically

### Permission errors

If you get permission errors:
- Verify your service role key has the correct permissions
- Check that RLS policies allow service role access
- Review Supabase logs for detailed error messages

## Next Steps

After setup:
1. ✅ Table created
2. ✅ Test sending events
3. ✅ View events in admin dashboard
4. ✅ Integrate telemetry tracking in your app

## Example Usage

```typescript
// Track a page view
await fetch('/api/telemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'page_view',
    payload: { page: '/landing', referrer: 'google' },
    ts: Date.now()
  })
});

// Track a scan completion
await fetch('/api/telemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'scan_completed',
    payload: { url: 'example.com', score: 87.3 },
    ts: Date.now()
  })
});
```

