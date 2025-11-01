# ⚡ Quick npm Fix Instructions

## Step 1: Fix Permissions (Run in Your Terminal)

**Open your terminal and run:**

```bash
sudo chown -R $(whoami):$(id -g) ~/.npm
```

**Enter your password when prompted.**

---

## Step 2: Run the Fix Script

**After permissions are fixed, run:**

```bash
./fix-npm-manual.sh
```

**This script will:**
- Clean npm cache
- Remove corrupted node_modules
- Fresh install all dependencies
- Install the 3 new packages (@react-email/components, @react-email/render, mixpanel-browser)
- Verify installation

---

## Or Do It All Manually

```bash
# 1. Fix permissions (requires password)
sudo chown -R $(whoami):$(id -g) ~/.npm

# 2. Clean and reinstall
npm cache clean --force
npm config set cache /tmp/npm-cache-$(whoami)
rm -rf node_modules package-lock.json
npm install
npm install @react-email/components @react-email/render mixpanel-browser

# 3. Verify
npm list @react-email/components @react-email/render mixpanel-browser
```

---

## Why Two Steps?

The interactive script (`fix-npm-complete.sh`) hangs waiting for password input. The manual script (`fix-npm-manual.sh`) skips the sudo step so you can run that command yourself first.

---

**Run the sudo command in your terminal, then run `./fix-npm-manual.sh`!** ✅

