# 🚀 Publish OpenAPI Spec to GitHub - Quick Guide

## Option 1: Create New Dedicated Repo (Recommended - 2 minutes)

### Step 1: Create Repository on GitHub
1. **Go to**: https://github.com/new
2. **Repository name**: `dealershipai-openapi` (or `openapi`)
3. **Visibility**: **Public** ✅ (Required for raw.githubusercontent.com URLs)
4. **Initialize**: ❌ Don't initialize with README, .gitignore, or license
5. **Click**: "Create repository"

### Step 2: Push OpenAPI File
```bash
# Create a temporary directory
mkdir -p ~/temp-openapi-repo
cd ~/temp-openapi-repo

# Initialize git
git init

# Copy the OpenAPI spec
cp /path/to/dealership-ai-dashboard/dealershipai-actions.yaml .

# Commit
git add dealershipai-actions.yaml
git commit -m "Add DealershipAI OpenAPI specification"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/dealershipai-openapi.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Get Raw URL
After pushing, your OpenAPI spec will be available at:
```
https://raw.githubusercontent.com/YOUR_USERNAME/dealershipai-openapi/main/dealershipai-actions.yaml
```

---

## Option 2: Use Existing Repo (Current Setup)

If you prefer to add it to your existing repo:

```bash
# Navigate to your project
cd /Users/stephaniekramer/dealership-ai-dashboard

# Stash current changes (if any)
git stash

# Pull latest from GitHub
git pull origin main

# Add OpenAPI file (already committed)
# Push to GitHub
git push origin main
```

**Raw URL will be**:
```
https://raw.githubusercontent.com/Kramerbrian/dealership-ai-dashboard/main/dealershipai-actions.yaml
```

---

## ✅ Verify the URL

After pushing, test the URL:
```bash
curl https://raw.githubusercontent.com/YOUR_USERNAME/REPO_NAME/main/dealershipai-actions.yaml
```

You should see the YAML content. If you see a 404, wait a few seconds for GitHub to update.

---

## 🎯 Next Steps

Once the GitHub URL is live:
1. ✅ **Import to ChatGPT**: See `CHATGPT_IMPORT_GUIDE.md`
2. ✅ **Configure Server URL**: Point to your Vercel deployment
3. ✅ **Test Endpoints**: Verify all 6 endpoints work

---

**Recommended**: Use Option 1 (dedicated repo) for cleaner organization.

