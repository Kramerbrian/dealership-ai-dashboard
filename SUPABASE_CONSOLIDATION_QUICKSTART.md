# 🚀 Supabase Consolidation Quick Start Guide

## ⚡ 5-Minute Setup

### **Step 1: Create Master Supabase Project (2 minutes)**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Click "New Project"**
3. **Fill in details**:
   - **Organization**: DealershipAI
   - **Name**: `dealershipai-master`
   - **Database Password**: Generate strong password
   - **Region**: US West (Oregon)
   - **Plan**: **Pro ($25/month)**
4. **Click "Create new project"**

### **Step 2: Get Master Project Credentials (1 minute)**

1. **Go to**: Settings → API
2. **Copy these values**:
   ```bash
   # Project URL
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-NEW-PROJECT-REF].supabase.co"
   
   # API Keys
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
   
   # Database URL
   DATABASE_URL="postgresql://postgres.[YOUR-NEW-PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
   ```

### **Step 3: Setup Master Project (2 minutes)**

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-NEW-PROJECT-REF].supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-KEY]"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# Run setup script
npx ts-node scripts/setup-master-project.ts
```

## 🔄 Migration Commands

### **Available Scripts**

Add these to your `package.json`:

```json
{
  "scripts": {
    "consolidate:setup": "ts-node scripts/setup-master-project.ts",
    "consolidate:migrate": "ts-node scripts/consolidate-supabase.ts migrate",
    "consolidate:validate": "ts-node scripts/consolidate-supabase.ts validate",
    "consolidate:env": "ts-node scripts/update-env-variables.ts update"
  }
}
```

### **Migration Workflow**

```bash
# 1. Setup master project
npm run consolidate:setup

# 2. Migrate data from existing projects
npm run consolidate:migrate

# 3. Update all environment variables
NEW_PROJECT_REF="your-new-project" npm run consolidate:env

# 4. Validate everything works
npm run consolidate:validate
```

## 📋 Environment Variables Update

### **Update Local Environment**

```bash
# Update .env.local
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-NEW-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-NEW-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-NEW-SERVICE-KEY]"
DATABASE_URL="postgresql://postgres.[YOUR-NEW-PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### **Update Vercel Environment**

1. **Go to**: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. **Update these variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL
   https://[YOUR-NEW-PROJECT-REF].supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   [YOUR-NEW-ANON-KEY]
   
   SUPABASE_SERVICE_ROLE_KEY
   [YOUR-NEW-SERVICE-KEY]
   
   DATABASE_URL
   postgresql://postgres.[YOUR-NEW-PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

## ✅ Verification Checklist

### **Local Testing**
- [ ] Run `npm run dev`
- [ ] Check dashboard loads without errors
- [ ] Test AI Answer Intelligence card
- [ ] Test Opportunity Calculator
- [ ] Verify database connections

### **Production Testing**
- [ ] Deploy to Vercel
- [ ] Test all API endpoints
- [ ] Verify AI intelligence metrics
- [ ] Check all dashboard features
- [ ] Monitor for errors

## 🚨 Troubleshooting

### **Common Issues**

#### **"Project not found" Error**
```bash
# Check your project URL format
# Should be: https://[PROJECT-REF].supabase.co
# Not: https://supabase.com/dashboard/project/[PROJECT-REF]
```

#### **"Invalid API Key" Error**
```bash
# Verify you're using the correct keys:
# - anon key for client-side
# - service_role key for server-side
```

#### **"Database connection failed"**
```bash
# Check DATABASE_URL format:
# postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### **Reset and Retry**

If something goes wrong:

```bash
# 1. Delete the master project in Supabase dashboard
# 2. Create a new one
# 3. Run setup again
npm run consolidate:setup
```

## 📊 What Gets Migrated

### **Database Tables**
- ✅ `ai_answer_events` - AI intelligence data
- ✅ `ai_snippet_share` - Snippet performance data
- ✅ `tenants` - Multi-tenant configuration
- ✅ `users` - User accounts
- ✅ `kpi_history` - Historical metrics
- ✅ All other existing tables

### **Database Features**
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Materialized views
- ✅ Database functions
- ✅ Seed data

### **Configuration**
- ✅ Environment variables
- ✅ API endpoints
- ✅ Authentication setup
- ✅ Multi-tenant isolation

## 💰 Cost Benefits

### **Before Consolidation**
- Multiple free/paid projects
- Scattered resources
- Complex management

### **After Consolidation**
- **Single Pro plan**: $25/month
- **Centralized management**
- **Better performance**
- **Simplified billing**

## 🎯 Next Steps After Migration

1. **Monitor Performance**
   - Check Supabase dashboard metrics
   - Monitor API response times
   - Watch for any errors

2. **Update Documentation**
   - Update all setup guides
   - Update deployment instructions
   - Update team documentation

3. **Decommission Old Projects**
   - Export any remaining data
   - Delete old Supabase projects
   - Update any external references

4. **Team Communication**
   - Notify team of new configuration
   - Share new environment variables
   - Update development setup

---

## 🆘 Need Help?

If you run into issues:

1. **Check the logs** from the migration scripts
2. **Verify environment variables** are correct
3. **Test locally** before deploying to production
4. **Check Supabase dashboard** for any errors

**Ready to consolidate?** Start with Step 1 above! 🚀
