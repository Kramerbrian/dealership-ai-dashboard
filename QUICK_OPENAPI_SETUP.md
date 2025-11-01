# 🚀 Quick OpenAPI Setup - Complete in 5 Minutes

## ❌ Issue with Vercel URL

The Vercel deployment requires authentication:
```
https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/dealershipai-actions.yaml
```

**Status**: 🔒 Protected by Vercel SSO (requires login)

**Solution**: Use GitHub raw URL instead (recommended for ChatGPT Actions)

---

## ✅ Recommended: GitHub Setup (2 minutes)

### Step 1: Create GitHub Repository

1. **Go to**: https://github.com/new
2. **Repository name**: `dealershipai-openapi`
3. **Visibility**: ✅ **Public** (required)
4. **Initialize**: ❌ Don't check any boxes
5. **Click**: "Create repository"

### Step 2: Push OpenAPI File

Run these commands:

```bash
# Create temporary repo directory
mkdir -p ~/temp-openapi && cd ~/temp-openapi

# Initialize git
git init

# Copy OpenAPI file
cp /Users/stephaniekramer/dealership-ai-dashboard/dealershipai-actions.yaml .

# Create README
cat > README.md << 'EOF'
# DealershipAI OpenAPI Specification

OpenAPI 3.1.0 specification for ChatGPT Actions integration.

## Raw URL
https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml

## Endpoints
- GET /api/ai-scores - Get AI visibility metrics
- GET /api/opportunities - List optimization opportunities  
- POST /api/site-inject - Deploy JSON-LD schema
- POST /api/refresh - Trigger fresh crawl
- GET /api/zero-click - Get zero-click rates
- GET /api/ai/health - Get AI engine health
EOF

# Commit
git add .
git commit -m "Add DealershipAI OpenAPI specification"

# Add remote (REPLACE YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/dealershipai-openapi.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Get Your Raw URL

After pushing, your OpenAPI spec will be available at:

```
https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

### Step 4: Test the URL

```bash
# Test that it works (should return YAML content)
curl https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml | head -20
```

---

## 🤖 Import to ChatGPT (2 minutes)

### Step 1: Open ChatGPT GPT Builder

1. Go to: https://chat.openai.com/gpts
2. Click: "Create" (or "Edit" existing GPT)

### Step 2: Import OpenAPI Spec

1. Click: "Add actions" → "Import from URL"
2. Paste: Your GitHub raw URL
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
   ```
3. Click: "Import"
4. Wait: Should load 6 endpoints

### Step 3: Configure Server URL

1. Find: "Server URL" or "Base URL" field
2. Set to: (choose one)

   **Option A - Current Vercel Deployment**:
   ```
   https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app
   ```
   ⚠️ Note: May require authentication bypass token

   **Option B - Wait for Custom Domain**:
   ```
   https://api.dealershipai.com
   ```
   ✅ Recommended when custom domain is ready

---

## 🔧 Alternative: Make Vercel URL Public (Optional)

If you want to use the Vercel URL instead:

### Disable Vercel Protection

1. **Go to**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/general
2. **Find**: "Deployment Protection" section
3. **Toggle OFF**: "Vercel Authentication"
4. **Save**: Changes apply to new deployments

**Then test**:
```bash
curl https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/dealershipai-actions.yaml
```

Should return YAML content instead of authentication page.

---

## ✅ Verification Checklist

After importing to ChatGPT:

- [ ] OpenAPI spec imports without errors
- [ ] All 6 endpoints appear:
  - ✅ getAIScores
  - ✅ listOpportunities
  - ✅ runSchemaInject
  - ✅ refreshDealerCrawl
  - ✅ checkZeroClick
  - ✅ fetchAIHealth
- [ ] Server URL is configured
- [ ] Test endpoint call works in ChatGPT

---

## 🎯 Quick Test

Ask your GPT:
```
"Get AI scores for example-dealer.com"
```

**Expected**: GPT calls the `getAIScores` endpoint successfully.

---

## 📝 Summary

**✅ Best Approach**: GitHub raw URL
- No authentication required
- Always accessible
- Standard practice for OpenAPI specs
- Works immediately with ChatGPT

**⏳ Setup Time**: ~5 minutes total
1. Create GitHub repo (1 min)
2. Push file (1 min)
3. Import to ChatGPT (2 min)
4. Test (1 min)

---

**Status**: ⏳ Ready to publish  
**Next**: Follow Step 1-2 above to create GitHub repo

