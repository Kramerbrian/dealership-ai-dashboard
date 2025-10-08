# Full Enterprise Schema Deployment Checklist

## 📋 Pre-Deployment
- [x] Schema file located: `dealershipai-enterprise/supabase-schema.sql`
- [x] 412 lines ready to deploy
- [x] Schema copied to clipboard
- [x] Supabase SQL Editor opened

## 🚀 Deployment Steps

### Step 1: Paste Schema
- [ ] SQL Editor is open
- [ ] Press **Cmd+A** (select all text in editor)
- [ ] Press **Cmd+V** (paste schema)
- [ ] Verify first line: `-- DealershipAI Enterprise Database Schema`

### Step 2: Execute
- [ ] Click green **"RUN"** button (bottom right)
- [ ] Wait for execution (15-20 seconds)
- [ ] Look for success message

### Step 3: Verify
- [ ] Run in terminal: `node test-full-schema.js`
- [ ] Check all 9 tables exist:
  - [ ] tenants (3 rows expected)
  - [ ] users (3 rows expected)
  - [ ] dealership_data (1 row expected)
  - [ ] ai_query_results (0 rows - empty)
  - [ ] audit_logs (0 rows - empty)
  - [ ] api_keys (0 rows - empty)
  - [ ] notification_settings (0 rows - empty)
  - [ ] reviews (2 rows expected)
  - [ ] review_templates (2 rows expected)

## 📊 What Gets Deployed

### Tables (9 total)
1. **tenants** - Multi-tenant organizations
2. **users** - User accounts with Clerk integration
3. **dealership_data** - AI visibility scores & metrics
4. **ai_query_results** - AI platform query tracking
5. **audit_logs** - Security & compliance logging
6. **api_keys** - API access management
7. **notification_settings** - User notification preferences
8. **reviews** - Customer review management
9. **review_templates** - Response template library

### Features
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-timestamps
- ✅ Sample data (3 tenants, 3 users, reviews)
- ✅ Foreign key constraints
- ✅ Check constraints for data validation

### Sample Data Included
- **Tenants**: 
  - SuperAdmin org
  - Terry Reid Hyundai (tier_2, $999/mo)
  - Enterprise Motors Group (enterprise, $50k/mo)
  
- **Users**:
  - Superadmin user
  - Terry Reid admin
  - Terry Reid staff member

- **Reviews**:
  - 2 sample reviews with responses

## ⚠️ Important Notes

- **RLS is ENABLED** in this schema (unlike minimal schema)
- Service role key bypasses RLS (for admin operations)
- Existing data in tenants/users/dealership_data will be preserved
- New tables will be created if they don't exist
- Duplicate type/table errors are normal (will be skipped)

## 🐛 Troubleshooting

### If deployment fails:
1. Check error message in Supabase
2. Common issues:
   - Type already exists → Safe to ignore
   - Table already exists → Safe to ignore
   - Permission denied → Check service role key

### If test fails:
```bash
# Check individual table
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('tenants').select('*').then(r => console.log(r));
"
```

## ✅ Success Criteria

After deployment, you should have:
- [ ] All 9 tables visible in Supabase Table Editor
- [ ] Sample data accessible
- [ ] RLS policies active (check Supabase Policies tab)
- [ ] Test script passes: `node test-full-schema.js`

---

**Ready?** Follow the steps above and paste the schema in Supabase!
