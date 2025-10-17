# 🏢 Supabase Account Consolidation Plan

## Current State Analysis

Based on the codebase analysis, I found multiple Supabase project references:

### **Current Supabase Projects:**
1. **Primary Project**: `vxrdvkhkombwlhjvtsmw.supabase.co` (Referenced in VERCEL_ENV_SETUP.md)
2. **Multiple Environment Templates**: Various project references in different env files
3. **Scattered Configuration**: Supabase URLs and keys spread across multiple files

## 🎯 Consolidation Strategy

### **Step 1: Create Master DealershipAI Supabase Project**

#### **Recommended Master Project Setup:**
- **Project Name**: `dealershipai-master`
- **Organization**: Your main DealershipAI organization
- **Plan**: **Pro Plan** ($25/month) for production use
- **Region**: US West (Oregon) for optimal performance

#### **Why Pro Plan:**
- ✅ **Unlimited API requests**
- ✅ **Advanced security features**
- ✅ **Priority support**
- ✅ **Custom domains**
- ✅ **Advanced monitoring**
- ✅ **Team collaboration**

### **Step 2: Database Migration Plan**

#### **Migration Strategy:**
1. **Create new master project** with Pro plan
2. **Export data** from existing projects
3. **Import consolidated data** into master project
4. **Update all environment variables**
5. **Test thoroughly** before switching
6. **Decommission old projects**

## 🚀 Implementation Steps

### **Phase 1: Setup Master Project (30 minutes)**

#### **1.1 Create New Supabase Project**
```bash
# Go to: https://supabase.com/dashboard
# Click "New Project"
# Organization: DealershipAI
# Name: dealershipai-master
# Database Password: [Generate strong password]
# Region: US West (Oregon)
# Plan: Pro ($25/month)
```

#### **1.2 Get Master Project Credentials**
```bash
# Project URL: https://[NEW-PROJECT-REF].supabase.co
# Go to: Settings > API
# Copy:
# - Project URL
# - anon public key
# - service_role key
```

### **Phase 2: Database Schema Migration (45 minutes)**

#### **2.1 Apply All Migrations to Master Project**
```bash
# Update .env.local with master project credentials
DATABASE_URL="postgresql://postgres.[NEW-PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[NEW-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[NEW-SERVICE-ROLE-KEY]"

# Run all migrations
npx prisma db push
npx prisma generate
```

#### **2.2 Apply AI Answer Intelligence Migration**
```sql
-- Run the migration we created earlier
-- File: db/migrations/0018_ai_answer_intel.sql
-- This will create all AI intelligence tables and views
```

### **Phase 3: Data Migration (60 minutes)**

#### **3.1 Export Data from Existing Projects**
```bash
# For each existing Supabase project:
# 1. Go to project dashboard
# 2. Go to SQL Editor
# 3. Run export queries for each table
# 4. Save results as CSV/JSON
```

#### **3.2 Import Data to Master Project**
```bash
# Use Supabase CLI or SQL Editor to import data
# Ensure all foreign key relationships are maintained
# Verify data integrity after import
```

### **Phase 4: Environment Variable Updates (30 minutes)**

#### **4.1 Update All Environment Files**
```bash
# Files to update:
# - .env.local
# - .env.production
# - All template files
# - Vercel environment variables
```

#### **4.2 New Master Environment Variables**
```bash
# Master DealershipAI Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[MASTER-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[MASTER-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[MASTER-SERVICE-ROLE-KEY]"
DATABASE_URL="postgresql://postgres.[MASTER-PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### **Phase 5: Code Updates (45 minutes)**

#### **5.1 Update All Supabase References**
```bash
# Search and replace in codebase:
# Old: vxrdvkhkombwlhjvtsmw.supabase.co
# New: [MASTER-PROJECT-REF].supabase.co
```

#### **5.2 Update Documentation**
```bash
# Update all documentation files with new project references
# Update deployment guides
# Update setup instructions
```

### **Phase 6: Testing & Validation (60 minutes)**

#### **6.1 Local Testing**
```bash
# Test all functionality locally
# Verify database connections
# Test API endpoints
# Validate AI Answer Intelligence system
```

#### **6.2 Production Testing**
```bash
# Deploy to staging environment
# Run comprehensive tests
# Verify all integrations work
# Test with real data
```

## 📋 Consolidation Checklist

### **Pre-Migration**
- [ ] Create master Supabase project with Pro plan
- [ ] Document all existing projects and their data
- [ ] Create backup of all existing data
- [ ] Plan downtime window for migration

### **Migration**
- [ ] Apply database schema to master project
- [ ] Migrate all data from existing projects
- [ ] Update all environment variables
- [ ] Update all code references
- [ ] Test all functionality

### **Post-Migration**
- [ ] Verify all systems working
- [ ] Update documentation
- [ ] Decommission old projects
- [ ] Monitor for any issues
- [ ] Update team on new configuration

## 🔧 Technical Implementation

### **Master Project Configuration**

#### **Database Settings:**
```sql
-- Enable all required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set up Row Level Security (RLS)
ALTER TABLE ai_answer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_snippet_share ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi-tenant isolation
CREATE POLICY "Users can only access their tenant data" ON ai_answer_events
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

#### **API Configuration:**
```typescript
// lib/supabase-master.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseMaster = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

### **Migration Scripts**

#### **Data Export Script:**
```typescript
// scripts/export-supabase-data.ts
import { createClient } from '@supabase/supabase-js'

async function exportAllData() {
  const projects = [
    'vxrdvkhkombwlhjvtsmw',
    // Add other project references
  ]
  
  for (const project of projects) {
    console.log(`Exporting data from ${project}...`)
    // Export logic here
  }
}
```

#### **Data Import Script:**
```typescript
// scripts/import-to-master.ts
import { supabaseMaster } from '../lib/supabase-master'

async function importAllData() {
  // Import logic here
  console.log('Importing data to master project...')
}
```

## 💰 Cost Optimization

### **Before Consolidation:**
- Multiple free/paid projects
- Scattered resources
- Inefficient usage

### **After Consolidation:**
- **Single Pro plan**: $25/month
- **Centralized management**
- **Better resource utilization**
- **Simplified billing**

### **Estimated Savings:**
- **Reduced complexity**: 80% less management overhead
- **Better performance**: Single optimized database
- **Cost efficiency**: One Pro plan vs multiple plans

## 🚨 Risk Mitigation

### **Backup Strategy:**
1. **Full database dumps** before migration
2. **Environment variable backups**
3. **Code repository backups**
4. **Rollback plan** if issues occur

### **Testing Strategy:**
1. **Staging environment** testing
2. **Gradual rollout** approach
3. **Monitoring** during migration
4. **Quick rollback** capability

## 📞 Support & Resources

### **Supabase Support:**
- **Pro plan includes priority support**
- **Direct access to Supabase team**
- **Advanced troubleshooting**

### **Migration Timeline:**
- **Total time**: ~4-5 hours
- **Downtime**: ~30 minutes (during final switch)
- **Testing**: ~2 hours
- **Documentation**: ~1 hour

---

## 🎯 Next Steps

1. **Review this plan** and approve the approach
2. **Create master Supabase project** with Pro plan
3. **Schedule migration window** (preferably off-peak hours)
4. **Execute migration** following the phases above
5. **Monitor and validate** all systems post-migration

**Ready to proceed?** Let me know if you'd like me to help with any specific phase of this consolidation!
