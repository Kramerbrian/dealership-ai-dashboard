# 🌐 Connect dealershipai.com to Vercel Deployment

**Target:** Connect `dealershipai.com` to `https://dealership-ai-competitive.vercel.app/`

---

## 🎯 Quick Method: Vercel Dashboard

### Step 1: Open Domain Settings
Go directly to the project's domain settings:
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-competitive/settings/domains
```

**Or navigate manually:**
1. Go to: https://vercel.com/dashboard
2. Find project: **dealership-ai-competitive**
3. Click: **Settings** → **Domains**

### Step 2: Add Domain
1. Click **"Add Domain"** button
2. Enter: `dealershipai.com`
3. Click **"Add"**

### Step 3: Configure DNS
Vercel will show you DNS records to add. You'll need:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Option B: A Record**
```
Type: A
Name: @
Value: 76.76.19.61
```

**Option C: Vercel Nameservers (Best)**
If your DNS provider supports it, use Vercel's nameservers:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Step 4: Verify Domain
1. After adding DNS records, wait 1-5 minutes
2. Vercel will automatically verify the domain
3. Status will change from "Pending" to "Valid"

---

## 🔧 Alternative: Vercel CLI (If Working)

If the CLI issues are resolved:

```bash
# Link to the project first
npx vercel link --project dealership-ai-competitive

# Add the domain
npx vercel domains add dealershipai.com

# Verify domain status
npx vercel domains ls
```

---

## 📋 DNS Provider Instructions

### Squarespace DNS
1. Go to: https://account.squarespace.com/domains
2. Click: **dealershipai.com** → **Advanced Settings** → **DNS**
3. Add the records shown in Vercel dashboard
4. Save and wait for propagation (1-5 minutes)

### Other DNS Providers
- **Cloudflare**: DNS → Records → Add record
- **GoDaddy**: DNS Management → Add record
- **Namecheap**: Advanced DNS → Add new record

---

## ✅ Verification

After DNS is configured, verify:

```bash
# Check DNS propagation
dig dealershipai.com
nslookup dealershipai.com

# Test HTTPS
curl -I https://dealershipai.com

# Should return 200 OK
```

---

## 🔗 Related URLs

- **Project Dashboard:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-competitive
- **Domain Settings:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-competitive/settings/domains
- **Deployments:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-competitive/deployments

---

## 🚨 Troubleshooting

### Domain Already in Use
If you see "Domain is linked to another Vercel account":
1. Go to the other project's domain settings
2. Remove `dealershipai.com` from that project
3. Then add it to `dealership-ai-competitive`

### DNS Not Propagating
- Wait 5-10 minutes (DNS can take time)
- Check DNS with: `dig dealershipai.com`
- Verify records match exactly what Vercel shows

### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after domain verification
- Check SSL status in Vercel dashboard

---

## 📝 Notes

- The domain `dealershipai.com` will point to the latest production deployment
- Both `dealershipai.com` and `www.dealershipai.com` will work (if configured)
- SSL certificates are automatically managed by Vercel

