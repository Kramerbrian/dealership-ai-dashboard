# Domain Setup Guide - PUBLIC_BASE_URL

## 🎯 Quick Answer

**Use: `https://dash.dealershipai.com`**

This is the recommended subdomain for your dashboard application.

---

## 📋 Two Options

### Option 1: Use Custom Domain (Recommended)

**If you have `dash.dealershipai.com` set up:**
```bash
PUBLIC_BASE_URL=https://dash.dealershipai.com
```

**To set it up:**
1. Add domain in Vercel:
   ```bash
   vercel domains add dash.dealershipai.com
   ```
2. Configure DNS:
   - Add CNAME record: `dash` → `cname.vercel-dns.com`
   - Or use Vercel's nameservers if managing DNS through Vercel
3. Wait for DNS propagation (5-30 minutes)
4. Use: `https://dash.dealershipai.com`

### Option 2: Use Vercel URL (Temporary)

**If you haven't set up custom domain yet:**
```bash
PUBLIC_BASE_URL=https://dealership-ai-dashboard-[hash].vercel.app
```

**⚠️ Note:** Vercel URLs change with each deployment, so this is only good for testing. For production, use a custom domain.

---

## 🔍 How to Find Your Current Deployment URL

```bash
# List recent deployments
vercel ls

# Or check Vercel Dashboard
# https://vercel.com/dashboard → Your Project → Deployments
```

---

## 💡 Why `dash.dealershipai.com`?

- ✅ Standard subdomain pattern for dashboards
- ✅ Keeps `dealershipai.com` free for marketing/landing page
- ✅ Matches your existing documentation
- ✅ Professional and clear
- ✅ Stable URL for QStash callbacks

---

## 🚀 Setup Steps

1. **Add domain to Vercel:**
   ```bash
   vercel domains add dash.dealershipai.com
   ```

2. **Configure DNS:**
   - Go to your DNS provider (where `dealershipai.com` is managed)
   - Add CNAME: `dash` → `cname.vercel-dns.com`
   - Or use Vercel's nameservers

3. **Wait for DNS propagation** (5-30 minutes)

4. **Set environment variable:**
   ```bash
   vercel env add PUBLIC_BASE_URL production
   # Enter: https://dash.dealershipai.com
   ```

5. **Verify:**
   ```bash
   curl https://dash.dealershipai.com/api/health
   ```

---

## 📝 Summary

**For production:** Use `https://dash.dealershipai.com`  
**For testing:** Use your Vercel deployment URL temporarily

The `PUBLIC_BASE_URL` is used for:
- QStash callbacks (async fix jobs)
- Internal API calls
- Webhook URLs

So it needs to be a **stable, accessible URL**.
