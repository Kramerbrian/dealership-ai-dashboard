# 🔄 Domain Transfer Guide - DealershipAI

## Current Situation

The domains are already assigned to another Vercel project. Here's how to fix this:

---

## 📊 Current Project Status

### Two Projects Detected:
1. **dealershipai-dashboard** (older project)
   - URL: https://dealershipai-nextjs.vercel.app
   - **Has the domains assigned**: main, marketing, dash

2. **dealership-ai-dashboard** (current project - NEW!)
   - URL: https://dealership-ai-dashboard-brian-kramers-projects.vercel.app
   - **Has the new /dash route with DealershipAIDashboardLA**
   - Needs domains transferred here

---

## ✅ Solution: Two Options

### Option 1: Use Existing Project (Recommended if it has your code)
If `dealershipai-dashboard` already has your code, just deploy the new dashboard there.

### Option 2: Transfer Domains (Recommended - Keep New Deployment)
Transfer the domains from the old project to the new one.

---

## 🔄 Option 2: Transfer Domains (Step-by-Step)

### Step 1: Remove Domains from Old Project

1. Go to the OLD project domains page:
   https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains

2. For each domain (main, marketing, dash):
   - Click the **three dots** (•••) next to the domain
   - Select **"Remove Domain"**
   - Confirm removal

3. Repeat for all three domains:
   - main.dealershipai.com
   - marketing.dealershipai.com
   - dash.dealershipai.com

### Step 2: Add Domains to New Project

1. Go to the NEW project domains page:
   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

2. Click **"Add Domain"** for each:
   - Enter: `main.dealershipai.com` → Click Add
   - Enter: `marketing.dealershipai.com` → Click Add
   - Enter: `dash.dealershipai.com` → Click Add

### Step 3: Verify DNS (Should Already Be Configured)

Your DNS records should already exist from previous setup:

```
Type: CNAME, Name: main, Value: cname.vercel-dns.com
Type: CNAME, Name: marketing, Value: cname.vercel-dns.com
Type: CNAME, Name: dash, Value: cname.vercel-dns.com
```

If not configured, add them now in your domain registrar.

### Step 4: Wait & Test

1. Wait 5-15 minutes for Vercel to verify and provision SSL
2. Test all three domains:
   ```bash
   curl -I https://main.dealershipai.com
   curl -I https://marketing.dealershipai.com
   curl -I https://dash.dealershipai.com/dash
   ```

---

## 🎯 Option 1: Deploy to Existing Project (Alternative)

If you want to use the existing `dealershipai-dashboard` project:

### Step 1: Copy the Dashboard Code

```bash
# Ensure you're in the correct directory
cd /Users/briankramer/dealership-ai-dashboard

# Check git status
git status
```

### Step 2: Link to the Existing Project

```bash
# Remove current Vercel link
rm -rf .vercel

# Link to the existing project
vercel link
# Select: dealershipai-dashboard (not dealership-ai-dashboard)
```

### Step 3: Deploy

```bash
# Deploy to production
vercel --prod
```

### Step 4: Domains Already Configured

Since the domains are already on that project, they'll work immediately!

---

## 🔍 Check Current Domain Status

### Via Vercel CLI (for dealershipai-dashboard project)

First, we need to check which project has the domains. You can do this via the web interface:

1. Go to: https://vercel.com/brian-kramers-projects
2. Click on **"dealershipai-dashboard"** project
3. Go to **Settings** → **Domains**
4. Check if the domains are listed there

### Via Web Interface

**Old Project Domains:**
https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains

**New Project Domains:**
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

---

## 📋 Decision Matrix

| Scenario | Recommended Action |
|----------|-------------------|
| Old project has all your latest code | Use Option 1 - Deploy there |
| New project has latest code (current) | Use Option 2 - Transfer domains |
| Both have different code | Choose which to use, transfer accordingly |
| Unsure | Check both projects via Vercel dashboard |

---

## 🚀 Quick Commands Reference

### Check Projects
```bash
# List all projects
vercel projects ls

# Inspect old project
vercel inspect https://dealershipai-nextjs.vercel.app

# Inspect new project
vercel inspect https://dealership-ai-dashboard-brian-kramers-projects.vercel.app
```

### Check Domains
```bash
# List domains (current team/project context)
vercel domains ls

# Check DNS propagation
dig main.dealershipai.com
dig marketing.dealershipai.com
dig dash.dealershipai.com
```

### Deploy Commands
```bash
# Deploy to current linked project
vercel --prod

# Force deploy
vercel --prod --force

# Check deployment status
vercel ls
```

---

## ⚠️ Important Notes

1. **Domains can only be on ONE project at a time**
   - Must remove from old project before adding to new

2. **DNS records don't need to change**
   - They still point to cname.vercel-dns.com
   - Vercel routes internally based on domain assignment

3. **SSL certificates will regenerate**
   - Automatic when you add domain to new project
   - Takes 5-15 minutes usually

4. **No downtime required**
   - DNS already points to Vercel
   - Transfer is instant on Vercel's side

---

## 🎯 Recommended Approach

Based on your setup, I recommend **Option 2** (Transfer Domains):

### Why?
- ✅ Your NEW project has the latest dashboard code
- ✅ Dashboard is already deployed and working
- ✅ Just need to move domain pointers
- ✅ Clean separation of projects

### Steps:
1. ✅ Open old project domains page (link above)
2. ✅ Remove all 3 domains from old project
3. ✅ Open new project domains page (link above)
4. ✅ Add all 3 domains to new project
5. ✅ Wait 5-15 minutes for SSL
6. ✅ Test all domains

---

## 🧪 Testing After Transfer

### Test URLs:
```bash
# Test main domain
curl -I https://main.dealershipai.com

# Test marketing domain
curl -I https://marketing.dealershipai.com

# Test dashboard domain
curl -I https://dash.dealershipai.com/dash
```

### Expected Results:
- ✅ HTTP 200 or 301/302 (redirect)
- ✅ SSL certificate valid (from Vercel)
- ✅ No certificate errors
- ✅ Content loads correctly

### Browser Test:
1. Open each URL in browser
2. Check SSL padlock (green)
3. Verify correct content loads
4. Test dashboard features on dash.dealershipai.com/dash

---

## 📞 Support Links

### Vercel Project Pages
- **Old Project**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard
- **New Project**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard

### Domain Settings
- **Old Project Domains**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains
- **New Project Domains**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

### Vercel Documentation
- **Domain Transfer**: https://vercel.com/docs/concepts/projects/domains/transferring-a-domain
- **Adding Domains**: https://vercel.com/docs/concepts/projects/domains/add-a-domain
- **Removing Domains**: https://vercel.com/docs/concepts/projects/domains/remove-a-domain

---

## ✅ Success Checklist

- [ ] Identified which project has domains
- [ ] Decided on Option 1 or Option 2
- [ ] Removed domains from old project (if Option 2)
- [ ] Added domains to new project (if Option 2)
- [ ] OR deployed to old project (if Option 1)
- [ ] Waited for SSL certificates
- [ ] Tested all three domains
- [ ] Verified dashboard works on dash.dealershipai.com/dash
- [ ] Checked SSL certificates valid
- [ ] No browser errors

---

**Next Action**: Choose your option and follow the steps above!

**Recommended**: Option 2 - Transfer domains to new project
**Time Required**: ~15 minutes
**Downtime**: None (seamless transfer)
