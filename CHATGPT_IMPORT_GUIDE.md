# 🤖 Import DealershipAI OpenAPI to ChatGPT Actions

## 📋 Prerequisites

- ✅ OpenAPI spec published to GitHub (see `PUBLISH_OPENAPI_TO_GITHUB.md`)
- ✅ Raw GitHub URL available
- ✅ ChatGPT Plus or GPT Builder access

---

## 🚀 Step-by-Step Import

### Step 1: Get Your OpenAPI URL

After publishing to GitHub, your raw URL will be:
```
https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
```

**Or if using existing repo**:
```
https://raw.githubusercontent.com/Kramerbrian/dealership-ai-dashboard/main/dealershipai-actions.yaml
```

### Step 2: Open ChatGPT GPT Builder

1. **Go to**: https://chat.openai.com/gpts
2. **Click**: "Create" (or "Edit" if updating existing GPT)
3. **You'll see**: GPT configuration interface

### Step 3: Add Actions

1. **Click**: "Add actions" button (or "Configure" → "Actions")
2. **Click**: "Import from URL" option
3. **Paste**: Your raw GitHub URL
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
4. **Click**: "Import" or "Fetch"

### Step 4: Verify Endpoints Load

You should see 6 endpoints appear:
- ✅ `getAIScores` - GET /api/ai-scores
- ✅ `listOpportunities` - GET /api/opportunities
- ✅ `runSchemaInject` - POST /api/site-inject
- ✅ `refreshDealerCrawl` - POST /api/refresh
- ✅ `checkZeroClick` - GET /api/zero-click
- ✅ `fetchAIHealth` - GET /api/ai/health

### Step 5: Configure Server URL

1. **Find**: "Server URL" or "Base URL" field in Actions settings
2. **Current deployment** (use this now):
   ```
   https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app
   ```
3. **Production** (update later when custom domain is ready):
   ```
   https://api.dealershipai.com
   ```

### Step 6: Test Authentication (If Required)

Some endpoints may require authentication:
- **Check**: If your API requires API keys
- **Add**: Authentication headers if needed
- **Test**: With a simple request first

---

## ✅ Verification Checklist

- [ ] OpenAPI spec imports without errors
- [ ] All 6 endpoints appear in the actions list
- [ ] Server URL is configured correctly
- [ ] No authentication errors in test requests
- [ ] GPT can successfully call the endpoints

---

## 🧪 Testing the Integration

### Test 1: Simple Query
Ask your GPT:
```
"Get AI scores for example-dealer.com"
```

**Expected**: GPT calls `getAIScores` endpoint

### Test 2: List Opportunities
```
"Show me optimization opportunities for my dealership"
```

**Expected**: GPT calls `listOpportunities` endpoint

### Test 3: Check Zero-Click
```
"What's the zero-click rate for dealer ID demo-123?"
```

**Expected**: GPT calls `checkZeroClick` endpoint

---

## 🔧 Troubleshooting

### "Failed to import"
- ✅ Verify URL is accessible (open in browser)
- ✅ Check YAML syntax is valid
- ✅ Ensure repository is **public**
- ✅ Wait a few seconds after pushing to GitHub

### "Endpoints not appearing"
- ✅ Check server URL is correct
- ✅ Verify OpenAPI version is 3.1.0
- ✅ Ensure operationId is defined for each endpoint

### "Authentication errors"
- ✅ Check if endpoints require auth
- ✅ Configure API keys in ChatGPT Actions
- ✅ Verify environment variables are set in Vercel

### "Connection refused"
- ✅ Verify Vercel deployment is live
- ✅ Test endpoint manually with curl
- ✅ Check CORS headers if needed

---

## 📝 Example GPT Instructions

Add these instructions to your GPT's system prompt:

```
You are a DealershipAI assistant that helps automotive dealerships optimize their AI visibility and search performance.

Available actions:
- Get AI scores (VAI, ATI, CRS) for any dealership domain
- List ranked schema optimization opportunities
- Deploy JSON-LD structured data to dealer websites
- Trigger fresh website crawls and metric recomputation
- Analyze zero-click rates and AI Overview inclusion
- Monitor AI engine health and visibility trends

Always explain what data you're retrieving and provide actionable insights.
```

---

## 🎯 Next Steps

After successful import:
1. ✅ **Test all 6 endpoints** through ChatGPT
2. ✅ **Update server URL** when custom domain is ready
3. ✅ **Configure authentication** if needed
4. ✅ **Add GPT instructions** for better responses
5. ✅ **Share GPT** with your team

---

## 📚 Resources

- **ChatGPT Actions Docs**: https://platform.openai.com/docs/actions
- **OpenAPI Specification**: https://swagger.io/specification/
- **GitHub Raw URLs**: https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files

---

**Status**: ⏳ Ready to import  
**Time**: ~5 minutes  
**Difficulty**: Easy

