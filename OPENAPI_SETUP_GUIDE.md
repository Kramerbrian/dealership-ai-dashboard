# 🚀 DealershipAI OpenAPI Setup Guide

## 📋 Overview

This guide shows you how to publish the `dealershipai-actions.yaml` OpenAPI specification for use with ChatGPT Actions and other API clients.

---

## 📁 File Location

**OpenAPI Spec**: `dealershipai-actions.yaml`

---

## 🌐 Publishing Options

### **Option 1: GitHub (Recommended - Free & Easy)**

#### Step 1: Create GitHub Repository
```bash
# Create a new repository on GitHub
# Repository name: openapi (or dealershipai-openapi)
# Visibility: Public (required for raw.githubusercontent.com links)
```

#### Step 2: Upload the File
1. **Clone your repo**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/openapi.git
   cd openapi
   ```

2. **Copy the YAML file**:
   ```bash
   cp ../dealershipai-actions.yaml .
   ```

3. **Commit and push**:
   ```bash
   git add dealershipai-actions.yaml
   git commit -m "Add DealershipAI OpenAPI specification"
   git push origin main
   ```

#### Step 3: Get Raw URL
**Format**: `https://raw.githubusercontent.com/YOUR_USERNAME/REPO_NAME/main/dealershipai-actions.yaml`

**Example**: `https://raw.githubusercontent.com/dealershipai/openapi/main/dealershipai-actions.yaml`

---

### **Option 2: Vercel Static Hosting (If Using Vercel)**

#### Step 1: Create Public Directory
```bash
mkdir -p public/api
cp dealershipai-actions.yaml public/api/dealershipai-actions.yaml
```

#### Step 2: Deploy
The file will be accessible at:
```
https://your-vercel-domain.com/api/dealershipai-actions.yaml
```

#### Step 3: Update Vercel Project
Your Next.js app will automatically serve files from `/public`, so after deployment:
- **URL**: `https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app/api/dealershipai-actions.yaml`

---

### **Option 3: GitHub Gist (Quickest - No Repo Needed)**

1. **Go to**: https://gist.github.com
2. **Create new gist**:
   - **Filename**: `dealershipai-actions.yaml`
   - **Content**: Paste the entire YAML file
   - **Visibility**: Public (required)
3. **Click**: "Create public gist"
4. **Get Raw URL**: Click "Raw" button → Copy URL
   - **Format**: `https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/dealershipai-actions.yaml`

---

### **Option 4: AWS S3 / CloudFront (For Production)**

```bash
# Upload to S3
aws s3 cp dealershipai-actions.yaml s3://your-bucket/api/dealershipai-actions.yaml \
  --content-type "application/x-yaml" \
  --acl public-read

# URL will be:
# https://your-bucket.s3.amazonaws.com/api/dealershipai-actions.yaml
# OR with CloudFront:
# https://d1234567890.cloudfront.net/api/dealershipai-actions.yaml
```

---

## 🤖 Using with ChatGPT Actions

### Step 1: Open ChatGPT GPT Builder
1. **Go to**: https://chat.openai.com/gpts
2. **Click**: "Create" or "Edit" your GPT
3. **Click**: "Add actions" → "Import from URL"

### Step 2: Import OpenAPI Spec
1. **Paste URL**: Your published OpenAPI YAML URL
   - Example: `https://raw.githubusercontent.com/dealershipai/openapi/main/dealershipai-actions.yaml`
2. **Click**: "Import"
3. **Verify**: All 6 endpoints appear:
   - ✅ `getAIScores`
   - ✅ `listOpportunities`
   - ✅ `runSchemaInject`
   - ✅ `refreshDealerCrawl`
   - ✅ `checkZeroClick`
   - ✅ `fetchAIHealth`

### Step 3: Configure Server URL
1. **Update server URL** in ChatGPT Actions:
   - **Production**: `https://api.dealershipai.com`
   - **Current**: `https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app`

---

## 🧪 Testing the OpenAPI Spec

### Validate YAML Syntax
```bash
# Install validator (optional)
npm install -g @stoplight/spectral-cli

# Validate the spec
spectral lint dealershipai-actions.yaml
```

### Test Endpoint Discovery
```bash
# Check if endpoints are accessible
curl https://your-domain.com/api/health
curl "https://your-domain.com/api/zero-click?dealerId=demo&days=30"
```

---

## 📝 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-scores` | GET | Get AI visibility metrics (VAI, ATI, CRS) |
| `/api/opportunities` | GET | List ranked schema optimization opportunities |
| `/api/site-inject` | POST | Deploy JSON-LD structured data to dealer CMS |
| `/api/refresh` | POST | Trigger fresh crawl and metric recomputation |
| `/api/zero-click` | GET | Get zero-click rates and AI Overview stats |
| `/api/ai/health` | GET | Get AI engine health and visibility trends |

---

## 🔧 Configuration Notes

### Server URLs
The OpenAPI spec includes two server URLs:
1. **Production**: `https://api.dealershipai.com` (when custom domain is configured)
2. **Vercel**: `https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app` (current)

ChatGPT will use the first server URL by default. You can:
- **Remove the production URL** until custom domain is set up
- **Reorder servers** to prioritize Vercel URL
- **Update manually** in ChatGPT Actions settings

---

## ✅ Checklist

- [ ] Create GitHub repository (or use Gist/Vercel)
- [ ] Upload `dealershipai-actions.yaml` to public location
- [ ] Verify raw URL is accessible (opens in browser)
- [ ] Test OpenAPI spec validation (optional)
- [ ] Import into ChatGPT Actions
- [ ] Configure correct server URL
- [ ] Test each endpoint through ChatGPT
- [ ] Update server URL when custom domain is ready

---

## 🎯 Quick Start (GitHub - 2 minutes)

```bash
# 1. Create repo on GitHub (via web UI)
# 2. Clone it locally
git clone https://github.com/YOUR_USERNAME/openapi.git
cd openapi

# 3. Copy YAML file
cp /path/to/dealershipai-actions.yaml .

# 4. Commit and push
git add dealershipai-actions.yaml
git commit -m "Add DealershipAI OpenAPI spec"
git push origin main

# 5. Use this URL in ChatGPT:
# https://raw.githubusercontent.com/YOUR_USERNAME/openapi/main/dealershipai-actions.yaml
```

---

## 🚨 Troubleshooting

### "URL not accessible"
- ✅ Ensure file is in **public** repository/Gist
- ✅ Check URL is **raw** (not GitHub's HTML view)
- ✅ Verify file is committed and pushed

### "Invalid OpenAPI format"
- ✅ Validate YAML syntax
- ✅ Check indentation (must be spaces, not tabs)
- ✅ Ensure `openapi: 3.1.0` is at the top

### "Endpoints not loading"
- ✅ Verify server URL matches your deployment
- ✅ Test endpoints manually with curl
- ✅ Check CORS headers if needed

### "Authentication errors"
- ✅ Configure API keys in ChatGPT Actions
- ✅ Check if endpoints require authentication
- ✅ Verify environment variables are set

---

## 📚 Additional Resources

- **OpenAPI Specification**: https://swagger.io/specification/
- **ChatGPT Actions Docs**: https://platform.openai.com/docs/actions
- **GitHub Raw URLs**: https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files

---

**Status**: ✅ OpenAPI spec ready  
**Next**: Publish to GitHub/Gist/Vercel and import into ChatGPT

