# ✅ OpenAPI Specification - Verified & Ready

## 🌐 Published URL

**GitHub Raw URL**: https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml

**Status**: ✅ Live and accessible

---

## ✅ Verified Components

### 1. **Opportunities Endpoint with Cursor Pagination**

**Path**: `/api/opportunities`  
**Method**: `GET`

**Parameters**:
- ✅ `domain` (required) - Dealership domain
- ✅ `limit` (optional, default: 10, max: 50) - Items per page
- ✅ `cursor` (optional) - Base64-encoded pagination cursor

**Response Schema**:
```yaml
opportunities: array
  - id: string
  - title: string
  - description: string
  - impact_score: number (0-100)
  - effort: enum [low, medium, high]
  - category: string
  - estimated_aiv_gain: number

nextCursor: string | null
  - Base64-encoded: "impact_score:id"
  - Example: "ODUuMDpvcHAtMQ=="
```

### 2. **All 6 Endpoints Documented**

✅ `/api/ai-scores` - Get AI visibility metrics  
✅ `/api/opportunities` - **Cursor-paginated opportunities**  
✅ `/api/site-inject` - Deploy JSON-LD schema  
✅ `/api/refresh` - Trigger fresh crawl  
✅ `/api/zero-click` - Get zero-click rates  
✅ `/api/ai/health` - Get AI engine health  

### 3. **Server URLs Configured**

- Production: `https://api.dealershipai.com`
- Current: `https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app`

---

## 🤖 Ready for ChatGPT Actions Import

### Import Steps:

1. **Go to**: https://chat.openai.com/gpts
2. **Click**: "Edit" on your GPT
3. **Click**: "Actions" → "Import from URL"
4. **Paste**: 
   ```
   https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
5. **Verify**: All 6 endpoints appear with correct parameters
6. **Save**: Changes

### Expected After Import:

- ✅ `getAIScores` - With `domain` parameter
- ✅ `listOpportunities` - With `domain`, `limit`, and `cursor` parameters
- ✅ `runSchemaInject` - With `dealerId`, `jsonld` body
- ✅ `refreshDealerCrawl` - With `domain` body
- ✅ `checkZeroClick` - With `dealerId`, `q`, `days` parameters
- ✅ `fetchAIHealth` - With `dealerId`, `intent` parameters

---

## 📋 Cursor Pagination Details

### How It Works:

1. **First Request**: No cursor
   ```
   GET /api/opportunities?domain=example.com&limit=10
   ```

2. **Response Includes**: `nextCursor` if more data exists
   ```json
   {
     "opportunities": [...],
     "nextCursor": "ODUuMDpvcHAtMQ=="
   }
   ```

3. **Next Request**: Use cursor
   ```
   GET /api/opportunities?domain=example.com&limit=10&cursor=ODUuMDpvcHAtMQ==
   ```

### Cursor Format:

- **Encoded**: Base64 string (e.g., `ODUuMDpvcHAtMQ==`)
- **Decoded**: `impact_score:id` (e.g., `85.0:opp-1`)
- **Purpose**: Efficient pagination without offset degradation

---

## ✅ Next Steps Checklist

- [x] OpenAPI spec created
- [x] Cursor pagination documented
- [x] Spec pushed to GitHub
- [x] Raw URL verified accessible
- [ ] **Import to ChatGPT Actions** (3 min)
- [ ] Test opportunities endpoint (after migration)
- [ ] Run database migration (create table)
- [ ] Verify cursor pagination works

---

## 🔍 Verification Commands

### Check Spec is Live:
```bash
curl https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml | grep -A 3 "cursor"
```

### Test API Endpoint (after migration):
```bash
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/opportunities?domain=example.com&limit=2"
```

---

## 📊 Summary

**Status**: ✅ OpenAPI spec complete and published  
**URL**: https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml  
**Ready For**: ChatGPT Actions import  
**Remaining**: Database migration + ChatGPT import + Testing

---

**Time to Complete**: ~10 minutes  
**Priority**: Import to ChatGPT Actions now, then run migration

