# 🚀 Deploy Opportunities Table & Update OpenAPI

## ✅ Step 1: Create Opportunities Table

### Option A: Using Prisma Migrate (Recommended)

```bash
# Make sure DATABASE_URL and DIRECT_URL are set
export DATABASE_URL="your-supabase-connection-string"
export DIRECT_URL="your-supabase-direct-connection-string"

# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_opportunities_table
```

### Option B: Run SQL Directly

```bash
# Using psql
psql $DATABASE_URL -f prisma/migrations/001_add_opportunities_table.sql

# Or using Supabase CLI
supabase db execute --file prisma/migrations/001_add_opportunities_table.sql
```

### Option C: Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project → SQL Editor
3. Paste the contents of `prisma/migrations/001_add_opportunities_table.sql`
4. Click "Run"

## ✅ Step 2: Verify Index Created

Run this SQL query to verify the cursor pagination index exists:

```sql
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunities' 
  AND indexname = 'idx_opportunities_impact_id';
```

**Expected Result**:
```
indexname                      | indexdef
-------------------------------+---------------------------------------------------------
idx_opportunities_impact_id    | CREATE INDEX idx_opportunities_impact_id ON opportunities ("impactScore" DESC, id DESC)
```

## ✅ Step 3: Update GitHub OpenAPI Spec

```bash
cd ~/temp-openapi-repo

# Copy updated spec
cp /Users/stephaniekramer/dealership-ai-dashboard/dealershipai-actions.yaml .

# Commit and push
git add dealershipai-actions.yaml
git commit -m "Update opportunities endpoint with cursor-based pagination"
git push origin main
```

## ✅ Step 4: Re-import to ChatGPT Actions

1. **Go to**: https://chat.openai.com/gpts
2. **Click**: "Edit" on your GPT
3. **Click**: "Actions" tab
4. **Click**: "Import from URL" (or update existing)
5. **Paste**: 
   ```
   https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
6. **Verify**: Opportunities endpoint shows cursor parameter
7. **Save**: Changes

## ✅ Step 5: Test Authentication Flow

### Test Sign Up
1. Visit: https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app
2. Click: "Sign Up"
3. Enter: test@dealershipai.com
4. Verify: Redirects to dashboard

### Test Sign In
1. Click: "Sign Out" (if signed in)
2. Click: "Sign In"
3. Enter: Same credentials
4. Verify: Session persists

## ✅ Step 6: Test Opportunities API

```bash
# First page (no cursor)
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"

# Next page (with cursor from previous response)
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2&cursor=ODUuMDpvcHAtMQ=="
```

**Expected Response**:
```json
{
  "opportunities": [
    {
      "id": "opp-1",
      "title": "Optimize Google Business Profile",
      "impact_score": 85,
      "effort": "low",
      "category": "citations",
      "estimated_aiv_gain": 15
    }
  ],
  "nextCursor": "NzIuMDpvcHAtMg=="
}
```

---

## 🎯 Checklist

- [ ] Run migration (create opportunities table)
- [ ] Verify index `idx_opportunities_impact_id` exists
- [ ] Update GitHub OpenAPI spec
- [ ] Re-import to ChatGPT Actions
- [ ] Test authentication (sign up/sign in)
- [ ] Test opportunities API endpoint
- [ ] Verify cursor pagination works

---

**Status**: ⏳ Ready to execute  
**Time**: ~15 minutes  
**Files**: 
- `prisma/migrations/001_add_opportunities_table.sql`
- `dealershipai-actions.yaml`
- `app/api/opportunities/route.ts`

