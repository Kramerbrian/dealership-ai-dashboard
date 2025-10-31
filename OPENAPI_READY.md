# ✅ DealershipAI OpenAPI Specification - Ready

## 📋 Status

**✅ OpenAPI Specification Created**
- **File**: `dealershipai-actions.yaml`
- **Location**: Root directory + `public/api/` (for Vercel hosting)
- **Status**: Ready for ChatGPT Actions import

---

## 🌐 Access URLs

### **Vercel Hosting (Current)**
```
https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/dealershipai-actions.yaml
```

### **GitHub (Recommended for ChatGPT)**
After publishing to GitHub:
```
https://raw.githubusercontent.com/YOUR_USERNAME/REPO_NAME/main/dealershipai-actions.yaml
```

---

## 📊 Included Endpoints

| Operation ID | Endpoint | Method | Purpose |
|--------------|----------|--------|---------|
| `getAIScores` | `/api/ai-scores` | GET | Get VAI, ATI, CRS metrics |
| `listOpportunities` | `/api/opportunities` | GET | Get ranked schema optimization tasks |
| `runSchemaInject` | `/api/site-inject` | POST | Deploy JSON-LD to dealer CMS |
| `refreshDealerCrawl` | `/api/refresh` | POST | Trigger fresh crawl & recompute |
| `checkZeroClick` | `/api/zero-click` | GET | Get zero-click rates & AI Overview stats |
| `fetchAIHealth` | `/api/ai/health` | GET | Get AI engine health & visibility trends |

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Publish to GitHub** (2 minutes)
```bash
# Create public GitHub repo
# Copy dealershipai-actions.yaml to repo
# Get raw URL: https://raw.githubusercontent.com/USER/REPO/main/dealershipai-actions.yaml
```

### **Step 2: Import to ChatGPT**
1. Go to: https://chat.openai.com/gpts
2. Click: "Create" or "Edit"
3. Click: "Add actions" → "Import from URL"
4. Paste: Your GitHub raw URL
5. Verify: All 6 endpoints appear

### **Step 3: Configure Server URL**
- **Current**: `https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app`
- **Production**: `https://api.dealershipai.com` (when custom domain is ready)

---

## 📁 File Locations

```
dealership-ai-dashboard/
├── dealershipai-actions.yaml          # Main OpenAPI spec (root)
├── public/
│   └── api/
│       └── dealershipai-actions.yaml # Served by Vercel
└── OPENAPI_SETUP_GUIDE.md            # Detailed setup instructions
```

---

## 🔍 Verification

### **Test Vercel URL** (After Next Deployment)
```bash
curl https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/dealershipai-actions.yaml
```

### **Validate YAML Syntax**
```bash
# Install validator
npm install -g @stoplight/spectral-cli

# Validate
spectral lint dealershipai-actions.yaml
```

---

## 📝 Next Steps

1. ✅ **OpenAPI Spec**: Created and ready
2. ⏳ **Publish to GitHub**: Create repo and push (see `OPENAPI_SETUP_GUIDE.md`)
3. ⏳ **Import to ChatGPT**: Follow Step 2 above
4. ⏳ **Test Endpoints**: Verify each endpoint works
5. ⏳ **Update Server URL**: When custom domain is ready

---

## 🎯 ChatGPT Actions Benefits

Once imported, your GPT can:
- ✅ **Get AI Scores**: Retrieve dealer metrics automatically
- ✅ **List Opportunities**: Find top schema optimization tasks
- ✅ **Inject Schema**: Deploy JSON-LD to dealer websites
- ✅ **Refresh Data**: Trigger fresh crawls on demand
- ✅ **Check Zero-Click**: Analyze AI Overview inclusion rates
- ✅ **Monitor Health**: Track AI engine status

---

**Status**: ✅ Ready to publish  
**Documentation**: See `OPENAPI_SETUP_GUIDE.md` for detailed instructions  
**Time to Import**: ~5 minutes

