# ✅ OpenAPI Setup - Complete Guide

## 🎯 Quick Start (5 Minutes)

### **Step 1: Publish to GitHub** (2 min)

#### Option A: Automated Script
```bash
./publish-openapi-to-github.sh
```
Follow the on-screen instructions to create the GitHub repo.

#### Option B: Manual (Recommended)
1. **Create repo**: https://github.com/new
   - Name: `dealershipai-openapi`
   - Visibility: **Public** ✅
   - Don't initialize with files
2. **Push file**:
   ```bash
   mkdir -p ~/temp-openapi && cd ~/temp-openapi
   git init
   cp /Users/stephaniekramer/dealership-ai-dashboard/dealershipai-actions.yaml .
   git add dealershipai-actions.yaml
   git commit -m "Add DealershipAI OpenAPI specification"
   git remote add origin https://github.com/YOUR_USERNAME/dealershipai-openapi.git
   git branch -M main
   git push -u origin main
   ```

#### Option C: Use Existing Repo
The file is already committed. Just resolve the merge conflict:
```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
git stash
git pull origin main
git push origin main
```

**Raw URL will be**:
```
https://raw.githubusercontent.com/Kramerbrian/dealership-ai-dashboard/main/dealershipai-actions.yaml
```

---

### **Step 2: Import to ChatGPT** (2 min)

1. **Go to**: https://chat.openai.com/gpts
2. **Click**: "Create" or "Edit"
3. **Click**: "Add actions" → "Import from URL"
4. **Paste your raw URL**:
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
5. **Verify**: All 6 endpoints appear ✅

---

### **Step 3: Configure Server URL** (1 min)

In ChatGPT Actions settings:
1. **Find**: "Server URL" or "Base URL"
2. **Set to** (current deployment):
   ```
   https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app
   ```
3. **Update later** (when custom domain ready):
   ```
   https://api.dealershipai.com
   ```

---

## 📊 Included Endpoints

| Endpoint | Method | Operation ID | Purpose |
|----------|--------|--------------|---------|
| `/api/ai-scores` | GET | `getAIScores` | Get VAI, ATI, CRS metrics |
| `/api/opportunities` | GET | `listOpportunities` | List ranked schema tasks |
| `/api/site-inject` | POST | `runSchemaInject` | Deploy JSON-LD to CMS |
| `/api/refresh` | POST | `refreshDealerCrawl` | Trigger fresh crawl |
| `/api/zero-click` | GET | `checkZeroClick` | Get zero-click rates |
| `/api/ai/health` | GET | `fetchAIHealth` | Get AI engine health |

---

## 🧪 Testing

### Test GitHub URL
```bash
curl https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
```

Should return YAML content (not 404).

### Test Endpoints
```bash
# Health check
curl https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/health

# Zero-click summary
curl "https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/zero-click/summary?tenantId=demo&days=30"
```

---

## 📁 Files Created

- ✅ `dealershipai-actions.yaml` - OpenAPI 3.1.0 specification
- ✅ `public/api/dealershipai-actions.yaml` - Served by Vercel
- ✅ `OPENAPI_SETUP_GUIDE.md` - Detailed publishing guide
- ✅ `OPENAPI_READY.md` - Quick reference
- ✅ `PUBLISH_OPENAPI_TO_GITHUB.md` - GitHub publishing options
- ✅ `CHATGPT_IMPORT_GUIDE.md` - Step-by-step ChatGPT import
- ✅ `publish-openapi-to-github.sh` - Automated publishing script

---

## 🎯 Current Status

- ✅ **OpenAPI Spec**: Created and validated
- ✅ **File Locations**: Root + public/api/
- ✅ **Documentation**: Complete guides created
- ⏳ **GitHub Publish**: Ready (choose option above)
- ⏳ **ChatGPT Import**: Ready after GitHub publish
- ⏳ **Server URL**: Configure after import

---

## 🚀 Quick Commands

### Publish to New Repo
```bash
./publish-openapi-to-github.sh
# Then follow on-screen instructions
```

### Use Existing Repo
```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
git stash
git pull origin main
git push origin main
# URL: https://raw.githubusercontent.com/Kramerbrian/dealership-ai-dashboard/main/dealershipai-actions.yaml
```

### Verify Vercel Hosting
```bash
# After next deployment:
curl https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/dealershipai-actions.yaml
```

---

## 📚 Documentation

- **Setup Guide**: `OPENAPI_SETUP_GUIDE.md`
- **GitHub Publishing**: `PUBLISH_OPENAPI_TO_GITHUB.md`
- **ChatGPT Import**: `CHATGPT_IMPORT_GUIDE.md`
- **Quick Reference**: `OPENAPI_READY.md`

---

**Time to Complete**: ~5 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to publish

