# ✅ Correct Vercel URLs

Your Vercel project is under the **`brian-kramer-dealershipai`** team.

## 🔗 Official Project URLs

### Domain Settings (ADD DOMAINS HERE)
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
```

### Project Dashboard
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
```

### Deployment History
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments
```

### Environment Variables
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
```

### General Settings
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings
```

---

## 📋 How to Add Domains

**The correct URL is now open** in your browser.

### Step 1: In the Domain Settings page:
1. Click **"Add Domain"**
2. Enter: `dealershipai.com`
3. Vercel will show verification requirement
4. Copy the verification token (starts with `vc-domain-verify=`)

### Step 2: Add TXT Record in Squarespace:
1. Go to: https://account.squarespace.com/domains
2. Click: **dealershipai.com** → **Advanced Settings** → **DNS**
3. Add TXT record:
   - Host: `_vercel`
   - Value: [paste token from Step 1]
4. Save

### Step 3: Run Automated Setup:
```bash
./scripts/complete-domain-setup.sh
```

---

## 🎯 URL Structure Explanation

Vercel URLs follow this pattern:
```
https://vercel.com/[TEAM]/[PROJECT]/[SECTION]
```

For your project:
- **TEAM:** `brian-kramer-dealershipai` (your Vercel team/account)
- **PROJECT:** `dealership-ai-dashboard` (your Next.js app)
- **SECTION:** `settings/domains` (the page you need)

---

## 🚨 Wrong URLs to Avoid

These URLs are INCORRECT (don't use):
- ❌ `vercel.com/brian-kramers-projects/...`
- ❌ Any URL without `brian-kramer-dealershipai`

---

## ✅ Quick Commands

```bash
# Open domain settings
open "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains"

# List all projects (to verify)
npx vercel project ls

# List all domains
npx vercel domains ls

# Check current deployment
npx vercel ls
```

---

**The correct domain settings page is now open!** Follow the 3 steps above to complete your setup.
