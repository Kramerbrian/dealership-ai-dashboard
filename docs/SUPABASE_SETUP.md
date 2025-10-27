# 🗄️ Supabase Database Setup

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `dealership-ai-dashboard`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for project to be ready (2-3 minutes)

## Step 2: Get Database Credentials

1. Go to **Settings** → **API**
2. Copy your credentials:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJ...` (public key)
   - **Service Role Key**: `eyJ...` (secret key)

## Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Step 4: Run Database Schema

### Option A: Using Supabase Dashboard
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `lib/database/schema.sql`
3. Paste into the SQL editor
4. Click **"Run"**

### Option B: Using CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option C: Using our setup script
```bash
# Make sure you have psql installed
npm run setup
```

## Step 5: Configure Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Enable RLS on all tables
3. Create policies for:
   - **Users can only see their own dealership data**
   - **Admins can see all data**
   - **Public access for waitlist**

## Step 6: Set up Database Functions

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create session limit check function
CREATE OR REPLACE FUNCTION check_session_limit(
  p_dealership_id UUID,
  p_action_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier VARCHAR(20);
  v_sessions_used INT;
  v_sessions_limit INT;
  v_action_cost INT;
BEGIN
  -- Get dealership tier and session info
  SELECT tier, sessions_used, sessions_limit
  INTO v_tier, v_sessions_used, v_sessions_limit
  FROM dealerships
  WHERE id = p_dealership_id;
  
  -- Define action costs
  v_action_cost := CASE p_action_type
    WHEN 'score_refresh' THEN 1
    WHEN 'competitor_analysis' THEN 2
    WHEN 'report_export' THEN 1
    WHEN 'ai_chat_query' THEN 1
    WHEN 'mystery_shop' THEN 5
    ELSE 0
  END;
  
  -- Check if action is allowed
  IF v_sessions_used + v_action_cost > v_sessions_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Update session count
  UPDATE dealerships
  SET sessions_used = sessions_used + v_action_cost
  WHERE id = p_dealership_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

## Step 7: Test Database Connection

1. Run `npm run dev`
2. Check browser console for any database errors
3. Test creating a dealership record
4. Verify RLS is working correctly

## Step 8: Production Setup

1. Update environment variables in Vercel
2. Run schema on production database
3. Test production database connection

## Troubleshooting

### Common Issues:
- **"Invalid API key"**: Check your environment variables
- **"RLS policy error"**: Verify RLS policies are set up correctly
- **"Function not found"**: Run the database functions setup

### Support:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
