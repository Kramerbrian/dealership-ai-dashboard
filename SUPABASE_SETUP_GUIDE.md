# Supabase Setup Guide - DealershipAI

## 🚀 **Quick Setup**

### Step 1: Get Your Supabase URL and Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Service Role Key** (starts with `eyJ...`)

### Step 2: Update Your Environment Variables

Update your `.env` file with the real values:

```bash
# Replace the placeholder values with your actual Supabase details
NEXT_PUBLIC_SUPABASE_URL="https://your-actual-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-actual-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"

# Also add this for the database fix script
SUPABASE_URL="https://your-actual-project-id.supabase.co"
```

### Step 3: Run the Database Fix

Once you have the correct environment variables:

```bash
# Export the variables and run the fix
export SUPABASE_URL="https://your-actual-project-id.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
./scripts/fix-database-schema.sh
```

## 🔧 **Alternative: Manual Database Setup**

If you prefer to set up the database manually through the Supabase dashboard:

### 1. Go to SQL Editor in Supabase Dashboard

### 2. Run this SQL:

```sql
-- Create public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Create security_events table
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Auth select security_events"
  ON public.security_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Auth insert security_events"
  ON public.security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON public.security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_events TO authenticated;
```

### 3. Verify Setup

Run this query to verify everything is working:

```sql
-- Check if table exists
SELECT to_regclass('public.security_events');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename='security_events';
```

## 🎯 **What This Fixes**

✅ **Schema Issues**: Creates the `public` schema if it doesn't exist  
✅ **Table Creation**: Creates the `security_events` table  
✅ **RLS Setup**: Enables Row Level Security  
✅ **Permissions**: Sets up proper access policies  
✅ **Performance**: Creates necessary indexes  

## 🚨 **Troubleshooting**

### Problem: "schema does not exist"
**Solution**: The migration creates the public schema automatically.

### Problem: "permission denied"
**Solution**: The migration sets up proper RLS policies for authenticated users.

### Problem: "connection failed"
**Solution**: Make sure your Supabase URL and keys are correct.

### Problem: "table already exists"
**Solution**: The migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

## 🎉 **Success Indicators**

After running the fix, you should see:
- ✅ Public schema exists
- ✅ security_events table created
- ✅ RLS enabled
- ✅ Policies created
- ✅ Indexes created
- ✅ Permissions granted

Your database will be ready for the DealershipAI system! 🚀