# 🗄️ Supabase Setup Guide

## Quick Setup

### 1. Create Telemetry Events Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create telemetry_events table
CREATE TABLE IF NOT EXISTS telemetry_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB,
  ts BIGINT NOT NULL,
  ip TEXT,
  user_id TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_events_ts ON telemetry_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_user_id ON telemetry_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at ON telemetry_events(created_at DESC);

-- Enable RLS
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role can insert telemetry_events"
  ON telemetry_events FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can read telemetry_events"
  ON telemetry_events FOR SELECT TO service_role USING (true);

-- User policy
CREATE POLICY "Users can read their own telemetry_events"
  ON telemetry_events FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id);
```

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_KEY`
   - **anon public key** → `SUPABASE_ANON_KEY` (optional, for client-side)

### 3. Add to .env.local

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

## Alternative: Use Migration File

If you have Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

Or manually run the SQL from `supabase/migrations/20250111000001_create_telemetry_events.sql`

## Verification

Test the setup:

```bash
# Test telemetry endpoint
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"type":"test_event","payload":{"test":true}}'
```

You should get: `{"ok":true}`

Then check your Supabase dashboard → Table Editor → `telemetry_events` to see the event.

## Troubleshooting

### "relation telemetry_events does not exist"
- Run the SQL migration above
- Check that you're using the correct database

### "new row violates row-level security policy"
- Make sure RLS policies are created
- Verify you're using `SUPABASE_SERVICE_KEY` (not anon key) in API routes

### "permission denied for table telemetry_events"
- Check that service role key is correct
- Verify RLS policies allow service_role access

