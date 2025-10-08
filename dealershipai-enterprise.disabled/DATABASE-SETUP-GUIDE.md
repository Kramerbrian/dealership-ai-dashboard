# DealershipAI Database Setup Guide

## 🎯 **Step-by-Step Supabase Database Setup**

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `dealershipai-enterprise`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### **Step 2: Get Your Credentials**

Once your project is ready, go to **Settings → API**:

1. **Project URL**: Copy the URL (looks like `https://[project-ref].supabase.co`)
2. **Anon Key**: Copy the `anon` `public` key
3. **Service Role Key**: Copy the `service_role` `secret` key

Go to **Settings → Database**:

4. **Database URL**: Copy the connection string (looks like `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

### **Step 3: Create Environment File**

Create a `.env.local` file in your project root with these values:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Clerk Authentication (Alternative)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Google APIs
GOOGLE_API_KEY="AIza..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# SEO Tools
AHREFS_API_KEY="..."
SEMRUSH_API_KEY="..."
PAGESPEED_API_KEY="AIzaSyBVvR8Q_VqMVHCbvQGqG7LqVW0m8h6QDIY"

# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Feature Flags
ENABLE_REAL_AI_QUERIES="false"
SYNTHETIC_CONFIDENCE="0.9"
CACHE_TTL_HOURS="24"
```

### **Step 4: Run Database Schema**

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the schema

This will create:
- All necessary tables (tenants, users, dealership_data, etc.)
- Row Level Security (RLS) policies
- Sample data for testing
- Indexes for performance

### **Step 5: Test Database Connection**

Run the database test script:

```bash
npm run db:test
```

This will verify:
- Database connectivity
- Schema is properly created
- Sample data is accessible

### **Step 6: Update Database Configuration**

Once the database is set up, we need to update the database configuration to use the real Prisma client instead of the mock:

1. **Install Prisma** (if not already installed):
   ```bash
   npm install prisma @prisma/client
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Update the database configuration** to use real Prisma client

### **Step 7: Verify Setup**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test tRPC endpoints**:
   - Visit `http://localhost:3000/trpc-test`
   - Check that dealership queries work
   - Verify authentication is working

3. **Check database in Supabase**:
   - Go to **Table Editor** in Supabase dashboard
   - Verify you can see the tables and sample data

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Database connection failed"**
   - Check your DATABASE_URL format
   - Verify your database password is correct
   - Ensure your Supabase project is fully initialized

2. **"No procedure found on path"**
   - This means tRPC can't connect to the database
   - Verify your environment variables are set correctly
   - Check that the database schema was created successfully

3. **"RLS policy violation"**
   - This is expected without proper authentication
   - We'll fix this when we set up Clerk authentication

### **Next Steps After Database Setup:**

1. **Fix tRPC Authentication**: Update the auth system to work with real database
2. **Configure Clerk**: Set up proper user authentication
3. **Test All Endpoints**: Verify all API routes work with real data
4. **Deploy to Production**: Update Vercel with real environment variables

## 📊 **Database Schema Overview**

The schema includes:

- **tenants**: Organizations/dealerships
- **users**: User accounts with roles and permissions
- **dealership_data**: AI visibility scores and metrics
- **ai_query_results**: AI platform query results
- **audit_logs**: System audit trail
- **reviews**: Customer reviews and responses
- **review_templates**: Response templates

All tables have Row Level Security (RLS) enabled for multi-tenant data isolation.

## 🎯 **Success Criteria**

You'll know the database setup is successful when:

✅ Database connection test passes  
✅ tRPC endpoints return real data instead of errors  
✅ You can see tables and data in Supabase dashboard  
✅ Authentication system works with real user data  
✅ All API routes function properly  

---

**Ready to proceed? Let me know when you've completed the database setup and I'll help you fix the tRPC authentication!**
