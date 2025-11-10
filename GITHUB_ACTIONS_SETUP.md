# 🤖 GitHub Actions Setup Guide

## ✅ **Quick Setup** (5 Minutes)

Follow these exact steps to enable automated export on git tags.

---

## 📋 **Step 1: Get Your Vercel Token**

1. **Go to Vercel Dashboard**:
   ```
   https://vercel.com/account/tokens
   ```

2. **Create New Token**:
   - Click "Create Token"
   - Name: `GitHub Actions - Claude Export`
   - Scope: `Full Account`
   - Expiration: `No Expiration` (or your preference)
   - Click "Create"

3. **Copy Token**:
   - ⚠️ **IMPORTANT**: Copy the token NOW (it won't be shown again)
   - Save it temporarily - you'll need it in Step 3

---

## 📋 **Step 2: Get Project IDs**

Your project IDs are:

```json
{
  "projectId": "prj_OenY0LJkWxuHWo5aJk0RaaFndjg5",
  "orgId": "team_bL2iJEcPCFg7kKTo6T2Ajwi4"
}
```

✅ **Already found from `.vercel/project.json`** - no action needed!

---

## 📋 **Step 3: Add GitHub Secrets**

1. **Go to GitHub Repository Settings**:
   ```
   https://github.com/Kramerbrian/dealership-ai-dashboard/settings/secrets/actions
   ```

2. **Add Three Secrets**:

   Click "New repository secret" for each:

   ### **Secret 1: VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: `[paste token from Step 1]`
   - Click "Add secret"

   ### **Secret 2: VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: `team_bL2iJEcPCFg7kKTo6T2Ajwi4`
   - Click "Add secret"

   ### **Secret 3: VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: `prj_OenY0LJkWxuHWo5aJk0RaaFndjg5`
   - Click "Add secret"

---

## 📋 **Step 4: Verify Secrets**

After adding all three secrets, you should see:

```
✅ VERCEL_TOKEN          Updated X seconds ago
✅ VERCEL_ORG_ID         Updated X seconds ago
✅ VERCEL_PROJECT_ID     Updated X seconds ago
```

---

## 🧪 **Step 5: Test the Workflow**

### **Method 1: Create Test Tag** (Recommended)

```bash
# Make sure all changes are committed
git add .
git commit -m "Add Claude export automation"

# Create test tag
git tag v3.0.1-test-automation
git push origin v3.0.1-test-automation
```

### **Method 2: Manual Trigger**

1. Go to GitHub Actions tab:
   ```
   https://github.com/Kramerbrian/dealership-ai-dashboard/actions
   ```

2. Click "Claude Export Auto-Deploy" workflow

3. Click "Run workflow" dropdown

4. Click green "Run workflow" button

---

## 👀 **Watch It Run**

1. **Go to Actions Tab**:
   ```
   https://github.com/Kramerbrian/dealership-ai-dashboard/actions
   ```

2. **Click on the Running Workflow**

3. **Watch Progress**:
   ```
   ✅ Checkout repository
   ✅ Setup Node.js
   ✅ Install dependencies
   ✅ Generate Claude export
   ✅ Verify export was created
   ✅ Deploy to Vercel
   ✅ Create GitHub Release
   ```

4. **Expected Time**: ~5 minutes

---

## ✅ **Verify Success**

### **1. Check GitHub Release**

Go to:
```
https://github.com/Kramerbrian/dealership-ai-dashboard/releases
```

You should see:
- New release with tag `v3.0.1-test-automation`
- ZIP file attachment
- Claude handoff prompt in release notes

### **2. Check Vercel Deployment**

Go to:
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
```

You should see:
- New deployment from GitHub Actions
- Status: "Ready"

### **3. Test Download**

```bash
# Test the export is accessible
curl -I https://[your-deployment-url]/claude/dealershipai_claude_export.zip

# Should return: HTTP 200
```

---

## 🎯 **What Happens Automatically**

When you push a git tag:

```
git tag v3.1.0
git push origin v3.1.0
```

GitHub Actions automatically:
1. ✅ Checks out your code
2. ✅ Installs dependencies
3. ✅ Runs `./scripts/export-for-claude.sh`
4. ✅ Verifies ZIP was created
5. ✅ Deploys to Vercel production
6. ✅ Creates GitHub Release with:
   - ZIP file attachment
   - Claude handoff prompt
   - Version info
   - What's included list

**Total time**: ~5 minutes (hands-free!)

---

## 🔄 **Usage Patterns**

### **Regular Updates**
```bash
# After code changes
git add .
git commit -m "Add new feature"
git push

# Create export snapshot
git tag v3.1.0
git push origin v3.1.0
# Automatic: Export → Deploy → Release
```

### **Pre-Release Testing**
```bash
# Create release candidate
git tag v3.2.0-rc1
git push origin v3.2.0-rc1
# Test the export before official release
```

### **Major Versions**
```bash
# Major version bump
git tag v4.0.0
git push origin v4.0.0
# Full automated release
```

### **Quick Snapshots**
```bash
# Before major refactor
git tag v3.1.0-pre-refactor
git push origin v3.1.0-pre-refactor
# Permanent snapshot available
```

---

## 🐛 **Troubleshooting**

### **Workflow Fails at "Install dependencies"**

**Problem**: `npm ci` fails

**Solution**:
```bash
# Delete lock file and regenerate
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate lock file"
git push
```

### **Workflow Fails at "Deploy to Vercel"**

**Problem**: Vercel secrets incorrect

**Solution**:
1. Verify token is valid (create new one if expired)
2. Double-check orgId and projectId match `.vercel/project.json`
3. Ensure token has full account access

### **Export ZIP Not Created**

**Problem**: Script fails

**Solution**:
```bash
# Test export script locally
./scripts/export-for-claude.sh

# Check for errors
# Fix any issues
# Commit and retry
```

### **Release Not Created**

**Problem**: GitHub token permissions

**Solution**:
1. Go to Repository Settings → Actions → General
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Click "Save"
5. Re-run workflow

---

## 🎨 **Customize Workflow**

### **Change Trigger Pattern**

Edit `.github/workflows/claude-export.yml`:

```yaml
on:
  push:
    tags:
      - 'v*'              # Any v* tag
      - 'release/*'       # Any release/* tag
      - 'export-*'        # Any export-* tag
```

### **Add Weekly Auto-Export**

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight UTC
  push:
    tags:
      - 'v*'
```

### **Add Slack Notification**

```yaml
- name: Notify Slack
  if: success()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"Claude export v${{ github.ref_name }} created!"}'
```

---

## 📊 **Monitoring**

### **View Recent Workflows**

```bash
# Install GitHub CLI
brew install gh

# List recent workflow runs
gh run list --workflow=claude-export.yml

# View specific run
gh run view [RUN_ID]
```

### **Check Deployment Status**

```bash
# List recent deployments
npx vercel ls

# Check specific deployment
npx vercel inspect [DEPLOYMENT_URL]
```

---

## ✅ **Quick Reference**

### **Required Secrets**
```
VERCEL_TOKEN          - From vercel.com/account/tokens
VERCEL_ORG_ID         - team_bL2iJEcPCFg7kKTo6T2Ajwi4
VERCEL_PROJECT_ID     - prj_OenY0LJkWxuHWo5aJk0RaaFndjg5
```

### **Test Command**
```bash
git tag v3.0.1-test && git push origin v3.0.1-test
```

### **Watch URL**
```
https://github.com/Kramerbrian/dealership-ai-dashboard/actions
```

### **Verify URL**
```
https://github.com/Kramerbrian/dealership-ai-dashboard/releases
```

---

## 🎉 **You're Done!**

After completing these steps, your Claude Export System will:

- ✅ **Auto-generate** exports when you push tags
- ✅ **Auto-deploy** to Vercel production
- ✅ **Auto-create** GitHub Releases with ZIP
- ✅ **Zero manual work** after git push

**Time to set up**: 5 minutes
**Time saved per export**: 5 minutes
**Break-even**: First automated export!

---

**Next**: Push a test tag and watch the magic happen! 🚀
