# 🔧 npm Permission Fix - Complete Instructions

## Current Situation

Your npm setup has two issues:
1. **npm cache has root-owned files** (needs sudo to fix)
2. **node_modules is corrupted** (multiple locked directories)

---

## ✅ SOLUTION: Run This Script

**I've created a complete fix script for you:**

```bash
./fix-npm-complete.sh
```

**This script will:**
1. Fix npm cache permissions (asks for your password)
2. Clean npm cache
3. Set temporary cache location
4. Remove corrupted node_modules
5. Fresh install all dependencies
6. Install new packages
7. Verify installation

**The script will prompt for your password once at the beginning.**

---

## Manual Alternative (If Script Doesn't Work)

If you prefer to run commands manually:

### Step 1: Fix npm Cache Permissions

```bash
sudo chown -R $(whoami):$(id -g) ~/.npm
```

**Enter your password when prompted.**

### Step 2: Complete Clean Reinstall

```bash
# Clean cache
npm cache clean --force

# Set temporary cache
npm config set cache /tmp/npm-cache-$(whoami)

# Remove corrupted files
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Install new packages
npm install @react-email/components @react-email/render mixpanel-browser
```

### Step 3: Verify

```bash
npm list @react-email/components @react-email/render mixpanel-browser
```

---

## Why This Happened

1. npm cache was created with root permissions (common macOS issue)
2. node_modules got corrupted during interrupted installs
3. Some directories are locked by system/processes

**The fix script addresses all of these issues.**

---

## After Fixing

Once packages are installed:

1. **Edit `.env.local`** with your API keys
2. **Start dev server:** `npm run dev`
3. **Test systems:** `./scripts/test-systems.sh`

---

## Quick Reference

**Single command fix (after entering password):**
```bash
./fix-npm-complete.sh
```

**Or manual fix:**
```bash
sudo chown -R $(whoami):$(id -g) ~/.npm && \
npm cache clean --force && \
npm config set cache /tmp/npm-cache-$(whoami) && \
rm -rf node_modules package-lock.json && \
npm install && \
npm install @react-email/components @react-email/render mixpanel-browser
```

---

**The script is ready - just run it!** ✅

