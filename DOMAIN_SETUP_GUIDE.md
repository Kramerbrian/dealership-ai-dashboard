# 🌐 Domain Setup Guide for dashboard.dealershipai.com

## Current Status

Vercel requires DNS verification before adding domains. You need to configure DNS **first**, then add the domain to Vercel.

---

## Step-by-Step DNS Configuration

### Step 1: Configure DNS at Your Registrar (Squarespace)

1. **Log into Squarespace**: https://account.squarespace.com
2. **Navigate to**: Settings → Domains → `dealershipai.com` → DNS Settings
3. **Remove existing A records** for `dashboard` (if any)
4. **Add a CNAME record**:

   ```
   Type: CNAME
   Host: dashboard
   Alias data: cname.vercel-dns.com
   TTL: 3600 (or default)
   ```

5. **Save the record**

### Step 2: Wait for DNS Propagation & Verify

After updating DNS:

1. **Wait 5–30 minutes** for propagation
2. **Verify with**:
   ```bash
   dig dashboard.dealershipai.com CNAME +short
   # Should return: cname.vercel-dns.com
   ```

### Step 3: Add Domain to Vercel

Once the DNS CNAME is in place and propagated:

```bash
npx vercel domains add dashboard.dealershipai.com

# Verify it's added
npx vercel domains ls
```

### Step 4: Update Clerk Allowed Origins

After the domain is verified, add it to Clerk:

```bash
# Use the script to update Clerk
./update-clerk-origins-direct.sh
```

Or manually in Clerk Dashboard:
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Navigate to: **Configure** → **Paths** → **Frontend API**
4. Find **"Allowed Origins"** or **"CORS Origins"**
5. Add: `https://dash.dealershipai.com`
6. Click **Save**

---

## Alternative: Using A Record (if CNAME not available)

If your DNS provider doesn't support CNAME for the root or subdomain, use A records:

```
Type: A
Name: dash
Value: 76.76.21.21
TTL: 3600
```

Then follow the same steps above.

---

## Verification

After setup, verify everything works:

1. **DNS Check**:
   ```bash
   nslookup dash.dealershipai.com
   # Should resolve to Vercel IPs
   ```

2. **SSL Certificate**:
   - Vercel automatically provisions SSL (5-10 minutes after domain add)
   - Check: `https://dash.dealershipai.com` should show a valid certificate

3. **Clerk Test**:
   - Visit: `https://dash.dealershipai.com`
   - Should load without "Invalid host" errors

---

## Current Vercel Domains

- **dealershipai-app.com** — Active ✅
- **dash.dealershipai.com** — Waiting for DNS configuration ⏳

Once the DNS CNAME is in place and propagated, Vercel should accept the domain. If you need help locating where to update DNS, share your registrar and I can guide you.

---

## Quick Reference

### DNS Provider Examples:

**GoDaddy**:
- DNS Management → Records → Add → CNAME
- Name: `dash`, Value: `cname.vercel-dns.com`

**Namecheap**:
- Advanced DNS → Add New Record → CNAME Record
- Host: `dash`, Value: `cname.vercel-dns.com`

**Cloudflare**:
- DNS → Records → Add Record
- Type: CNAME, Name: `dash`, Target: `cname.vercel-dns.com`, Proxy: Off

---

**Once DNS is configured, run:**
```bash
npx vercel domains add dash.dealershipai.com
```
