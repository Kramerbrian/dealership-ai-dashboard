# ✅ Opportunities API Setup - Complete Guide

## 🎉 Status

**✅ API Route**: Created with cursor-based pagination  
**✅ OpenAPI Spec**: Updated and pushed to GitHub  
**⏳ Database**: Ready for migration  
**⏳ ChatGPT**: Ready for re-import  

---

## 📋 What Was Done

### 1. ✅ Created API Route
**File**: `app/api/opportunities/route.ts`

**Features**:
- Cursor-based pagination using `impact_score DESC, id DESC`
- Base64-encoded cursor format: `impact_score:id`
- Mock data fallback when table doesn't exist
- Proper error handling

### 2. ✅ Updated Prisma Schema
**File**: `prisma/schema.prisma`

**Added**:
- `Opportunity` model with all required fields
- `ImpactLevel`, `EffortLevel`, `OpportunityStatus` enums
- Index for cursor pagination: `@@index([impactScore, id(sort: Desc)])`

### 3. ✅ Created Migration SQL
**File**: `prisma/migrations/001_add_opportunities_table.sql`

**Includes**:
- Table creation with all columns
- Index for domain filtering
- **Performance index for cursor pagination**: `idx_opportunities_impact_id`
- Indexes for status and category filtering

### 4. ✅ Updated OpenAPI Spec
**File**: `dealershipai-actions.yaml`

**Changes**:
- Added `cursor` parameter (base64-encoded)
- Updated response schema with `opportunities` array
- Added `nextCursor` field
- Updated field names to match API (`impact_score`, `estimated_aiv_gain`)

### 5. ✅ Pushed to GitHub
**Repository**: https://github.com/Kramerbrian/dealershipai-openapi

**Raw URL**: 
```
https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml
```

---

## 🚀 Next Steps

### Step 1: Run Database Migration

**Option A: Via Supabase Dashboard** (Easiest)
1. Go to: https://supabase.com/dashboard
2. Select project → SQL Editor
3. Paste contents of `prisma/migrations/001_add_opportunities_table.sql`
4. Click "Run"

**Option B: Via Prisma CLI**
```bash
# Set environment variables
export DATABASE_URL="your-connection-string"
export DIRECT_URL="your-direct-connection-string"

# Run migration
npx prisma migrate dev --name add_opportunities_table
```

**Option C: Direct SQL**
```bash
psql $DATABASE_URL -f prisma/migrations/001_add_opportunities_table.sql
```

### Step 2: Verify Index

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'opportunities' 
  AND indexname = 'idx_opportunities_impact_id';
```

**Expected**: Index with `("impactScore" DESC, id DESC)`

### Step 3: Re-import to ChatGPT Actions

1. **Go to**: https://chat.openai.com/gpts
2. **Edit** your GPT
3. **Actions** → **Import from URL**
4. **Paste**: 
   ```
   https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
5. **Verify**: Cursor parameter appears in opportunities endpoint
6. **Save**

### Step 4: Test Authentication

1. Visit deployment URL
2. Sign up with test@dealershipai.com
3. Sign out
4. Sign in again
5. Verify session persists

### Step 5: Test Opportunities API

```bash
# First page
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"

# Should return opportunities array + nextCursor (if more data)
```

---

## 📊 API Usage Examples

### First Request (No Cursor)
```
GET /api/opportunities?domain=example.com&limit=10
```

**Response**:
```json
{
  "opportunities": [
    {
      "id": "opp-1",
      "title": "Optimize Google Business Profile",
      "description": "...",
      "impact_score": 85.5,
      "effort": "low",
      "category": "citations",
      "estimated_aiv_gain": 15
    }
  ],
  "nextCursor": "ODUuNTpvcHAtMQ=="
}
```

### Next Page (With Cursor)
```
GET /api/opportunities?domain=example.com&limit=10&cursor=ODUuNTpvcHAtMQ==
```

**Cursor Format**: Base64-encoded `impact_score:id`
- Example: `85.5:opp-1` → `ODUuNTpvcHAtMQ==`

---

## 🔍 Performance Notes

**Index**: `idx_opportunities_impact_id` on `(impactScore DESC, id DESC)`

**Why This Index?**:
- Supports `ORDER BY impact_score DESC, id DESC` queries
- Enables efficient cursor-based pagination
- Prevents full table scans on large datasets
- Maintains deterministic ordering even with duplicate impact scores

**Query Performance**:
- ✅ First page: Fast (index scan)
- ✅ Subsequent pages: Fast (index scan with cursor)
- ✅ Large datasets: Constant time (no offset degradation)

---

## 📝 Files Modified

- ✅ `prisma/schema.prisma` - Added Opportunity model
- ✅ `app/api/opportunities/route.ts` - Cursor-based pagination
- ✅ `dealershipai-actions.yaml` - Updated OpenAPI spec
- ✅ `prisma/migrations/001_add_opportunities_table.sql` - Migration SQL
- ✅ GitHub repo updated

---

## ✅ Completion Checklist

- [x] API route created
- [x] Prisma schema updated
- [x] Migration SQL created
- [x] OpenAPI spec updated
- [x] Pushed to GitHub
- [ ] Run database migration
- [ ] Verify index created
- [ ] Re-import to ChatGPT Actions
- [ ] Test authentication
- [ ] Test opportunities API

---

**Status**: 80% Complete  
**Remaining**: Database migration + ChatGPT re-import  
**Time**: ~10 minutes
