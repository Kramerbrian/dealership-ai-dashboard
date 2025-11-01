# 🔧 Fix npm Permissions - Quick Guide

## The Problem
1. **npm cache permissions** - Cache folder has root-owned files
2. **node_modules corruption** - Some directories locked/corrupted

---

## ✅ SOLUTION: Run These Commands

### Step 1: Fix npm Cache Permissions (REQUIRES YOUR PASSWORD)

**Open your terminal and run:**

```bash
sudo chown -R $(whoami):$(id -g) ~/.npm
```

**You'll be prompted for your password.** This fixes the cache permission issue.

---

### Step 2: Clean and Reinstall

**After fixing permissions, run:**

```bash
# Clean npm cache
npm cache clean --force

# Use temporary cache (bypasses any remaining issues)
npm config set cache /tmp/npm-cache-$(whoami)

# Remove corrupted node_modules directories
rm -rf node_modules/eslint-config-next

# Install packages
npm install @react-email/components @react-email/render mixpanel-browser
```

---

## Alternative: Complete Clean Reinstall

**If the above doesn't work:**

```bash
# Fix permissions first
sudo chown -R $(whoami):$(id -g) ~/.npm

# Complete clean
rm -rf node_modules package-lock.json
npm cache clean --force

# Fresh install
npm install
npm install @react-email/components @react-email/render mixpanel-browser
```

---

## Verify Installation

**Check if packages installed:**

```bash
npm list @react-email/components @react-email/render mixpanel-browser
```

**Should show:**
```
dealership-ai-dashboard@1.0.0
├── @react-email/components@...
├── @react-email/render@...
└── mixpanel-browser@...
```

---

## What I've Already Done

✅ Created fix scripts  
✅ Set up temporary cache location  
✅ Created documentation  
✅ Attempted workarounds  

**The `sudo chown` command is the only step that needs your password.**

---

## Next Steps After Fixing

1. ✅ Install packages
2. ✅ Configure `.env.local` with API keys
3. ✅ Run `npm run dev`
4. ✅ Test with `./scripts/test-systems.sh`

---

**Run the `sudo chown` command first - it's the key fix!** 🔑

