# ✅ Opportunities API Setup - Final Checklist

## 🎯 Current Status

**✅ Completed**:
- API route with cursor-based pagination (`app/api/opportunities/route.ts`)
- Prisma schema updated (`Opportunity` model)
- Migration SQL file created (`prisma/migrations/001_add_opportunities_table.sql`)
- OpenAPI spec updated locally (`dealershipai-actions.yaml`)
- Performance index defined (`idx_opportunities_impact_id`)

**⏳ Remaining**:
- [ ] Run database migration (create table + index)
- [ ] Update GitHub OpenAPI spec (if not already)
- [ ] Re-import to ChatGPT Actions
- [ ] Test authentication flow
- [ ] Test opportunities API endpoint

---

## 🚀 Step-by-Step Actions

### Step 1: Create Opportunities Table (5 min)

**Choose one method**:

#### Method A: Supabase Dashboard (Easiest) ⭐
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Open file: `prisma/migrations/001_add_opportunities_table.sql`
5. Copy all SQL content
6. Paste into SQL Editor
7. Click "Run" or press Cmd/Ctrl + Enter

#### Method B: Prisma CLI
```bash
# Set environment variables first
export DATABASE_URL="your-supabase-connection-string"
export DIRECT_URL="your-supabase-direct-connection-string"

# Run migration
npx prisma migrate dev --name add_opportunities_table
```

#### Method C: Direct SQL
```bash
psql $DATABASE_URL -f prisma/migrations/001_add_opportunities_table.sql
```

### Step 2: Verify Index Created (1 min)

Run this in Supabase SQL Editor:

```sql
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunities' 
  AND indexname = 'idx_opportunities_impact_id';
```

**Expected**: Shows index with `("impactScore" DESC, id DESC)`

### Step 3: Update GitHub OpenAPI Spec (2 min)

```bash
cd ~/temp-openapi-repo

# Copy updated spec
cp /Users/stephaniekramer/dealership-ai-dashboard/dealershipai-actions.yaml .

# Check if there are changes
git diff dealershipai-actions.yaml

# If changes exist, commit and push
git add dealershipai-actions.yaml
git commit -m "Update opportunities endpoint with cursor-based pagination"
git push origin main
```

**Verify**: Visit https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml
- Should show `cursor` parameter in opportunities endpoint
- Should show `nextCursor` in response

### Step 4: Re-import to ChatGPT Actions (3 min)

1. **Go to**: https://chat.openai.com/gpts
2. **Click**: "Edit" on your GPT (or create new)
3. **Click**: "Add actions" or "Actions" tab
4. **Click**: "Import from URL"
5. **Paste**: 
   ```
   https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
6. **Wait**: Should import 6 endpoints
7. **Verify**: Opportunities endpoint shows:
   - `cursor` parameter (optional, base64 string)
   - Response includes `nextCursor` field
8. **Save**: Changes

### Step 5: Test Authentication Flow (5 min)

#### Test Sign Up
1. Visit: https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app
2. Click: "Sign Up" button
3. Enter:
   - Email: `test@dealershipai.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
4. Submit
5. **Expected**: Redirects to `/dashboard`

#### Test Sign In
1. Click: "Sign Out" (if signed in)
2. Click: "Sign In"
3. Enter: Same credentials
4. Submit
5. **Expected**: Redirects to `/dashboard`
6. **Refresh page**: Should still be signed in (session persists)

### Step 6: Test Opportunities API (3 min)

#### First Page (No Cursor)
```bash
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"
```

**Expected Response**:
```json
{
  "opportunities": [
    {
      "id": "opp-1",
      "title": "Optimize Google Business Profile",
      "description": "Your Google Business Profile is missing key information...",
      "impact_score": 85,
      "effort": "low",
      "category": "citations",
      "estimated_aiv_gain": 15
    },
    {
      "id": "opp-2",
      "title": "Improve Local Citation Consistency",
      "impact_score": 72,
      "effort": "medium",
      "category": "citations",
      "estimated_aiv_gain": 12
    }
  ],
  "nextCursor": "NzIuMDpvcHAtMg=="
}
```

#### Next Page (With Cursor)
```bash
# Use the nextCursor from previous response
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2&cursor=NzIuMDpvcHAtMg=="
```

**Expected**: Returns next 2 opportunities with a new `nextCursor` (or `null` if no more pages)

---

## ✅ Completion Checklist

- [ ] **Database**: Opportunities table created
- [ ] **Index**: `idx_opportunities_impact_id` verified
- [ ] **GitHub**: OpenAPI spec updated and pushed
- [ ] **ChatGPT**: Spec re-imported successfully
- [ ] **Auth**: Sign up works
- [ ] **Auth**: Sign in works
- [ ] **Auth**: Session persists
- [ ] **API**: First page returns opportunities
- [ ] **API**: Cursor pagination works
- [ ] **API**: nextCursor format is correct

---

## 🔍 Troubleshooting

### Migration Fails
**Error**: "relation opportunities already exists"
- **Fix**: Table already exists, skip this step or drop/recreate

**Error**: "Environment variable not found: DIRECT_URL"
- **Fix**: Use Supabase Dashboard method (Option A) instead

### ChatGPT Import Fails
**Error**: "Invalid OpenAPI format"
- **Fix**: Verify raw URL is accessible (open in browser)
- **Fix**: Check YAML syntax is valid

### API Returns Mock Data
**Expected**: If table doesn't exist, API returns mock data
- **Fix**: Run migration to create table
- **Note**: Mock data demonstrates cursor pagination working

### Cursor Doesn't Work
**Issue**: `nextCursor` is null when there should be more data
- **Fix**: Verify limit is less than total items
- **Fix**: Check database has more than `limit` records

---

## 📊 Performance Index Details

**Index Name**: `idx_opportunities_impact_id`  
**Columns**: `("impactScore" DESC, id DESC)`  
**Purpose**: Supports cursor-based pagination queries

**Query Pattern**:
```sql
SELECT * FROM opportunities
WHERE domain = $1
  AND (impactScore < $2 OR (impactScore = $2 AND id < $3))
ORDER BY impactScore DESC, id DESC
LIMIT $4
```

**Benefits**:
- ✅ Constant query time regardless of dataset size
- ✅ No offset degradation
- ✅ Deterministic ordering
- ✅ Efficient index scan

---

## 📝 Files Reference

- **Migration SQL**: `prisma/migrations/001_add_opportunities_table.sql`
- **API Route**: `app/api/opportunities/route.ts`
- **OpenAPI Spec**: `dealershipai-actions.yaml`
- **Prisma Schema**: `prisma/schema.prisma`
- **GitHub Repo**: https://github.com/Kramerbrian/dealershipai-openapi

---

## 🎯 Quick Start (Choose Your Path)

**Path 1: Database First** (Recommended)
1. Run migration (Step 1)
2. Verify index (Step 2)
3. Test API (Step 6)
4. Update GitHub spec (Step 3)
5. Re-import ChatGPT (Step 4)
6. Test auth (Step 5)

**Path 2: ChatGPT First**
1. Update GitHub spec (Step 3)
2. Re-import ChatGPT (Step 4)
3. Run migration (Step 1)
4. Test everything else

---

**Total Time**: ~20 minutes  
**Status**: 80% Complete  
**Next**: Choose your path and start with Step 1 or Step 3

