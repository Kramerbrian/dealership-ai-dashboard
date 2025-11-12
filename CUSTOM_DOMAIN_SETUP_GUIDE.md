# 🌐 Custom Domain Setup - dealershipai.com

**Status:** Ready to Configure  
**Estimated Time:** 15-20 minutes

---

## Step 1: Add Domain in Vercel Dashboard

### 1.1 Navigate to Domain Settings

1. Go to: [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `dealership-ai-dashboard`
3. Click **Settings** tab
4. Click **Domains** in the left sidebar

### 1.2 Add Primary Domain

1. Click **"Add Domain"** button
2. Enter: `dealershipai.com`
3. Click **"Add"**

### 1.3 Add WWW Domain (Optional but Recommended)

1. Click **"Add Domain"** again
2. Enter: `www.dealershipai.com`
3. Click **"Add"**

---

## Step 2: Configure DNS Records

Vercel will provide you with DNS configuration options. You'll need to add records to your domain registrar.

### 2.1 Get DNS Configuration from Vercel

After adding the domain, Vercel will show:
- **Option A:** A record configuration
- **Option B:** CNAME record configuration (recommended)

### 2.2 Recommended: CNAME Configuration

**For `dealershipai.com`:**
```
Type: CNAME
Name: @ (or root)
Value: cname.vercel-dns.com
```

**For `www.dealershipai.com`:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2.3 Alternative: A Record Configuration

If your registrar doesn't support CNAME on root domain:

**Get Vercel's IP addresses:**
- Vercel will provide IP addresses when you select "A Record" option
- Typically: `76.76.21.21` (but verify with Vercel)

**Add A records:**
```
Type: A
Name: @
Value: [Vercel IP Address 1]

Type: A
Name: @
Value: [Vercel IP Address 2]
```

---

## Step 3: Update DNS at Your Registrar

### Common Registrars:

#### Namecheap
1. Go to: Domain List → Manage → Advanced DNS
2. Add the DNS records provided by Vercel
3. Save changes

#### GoDaddy
1. Go to: My Products → DNS Management
2. Add the DNS records
3. Save changes

#### Google Domains / Cloud Identity
1. Go to: DNS → Custom Records
2. Add the DNS records
3. Save changes

#### Cloudflare
1. Go to: DNS → Records
2. Add the DNS records
3. Set proxy status: **DNS only** (gray cloud) initially
4. After verification, can enable proxy (orange cloud)

---

## Step 4: Wait for DNS Propagation

**Typical Wait Time:** 5-60 minutes

**Check Propagation:**
```bash
# Check DNS resolution
dig dealershipai.com
nslookup dealershipai.com

# Or use online tools:
# https://dnschecker.org/
# https://www.whatsmydns.net/
```

**Verify in Vercel:**
- Go back to Vercel Dashboard → Domains
- Status should show: **"Valid Configuration"** ✅
- SSL certificate will be issued automatically (usually < 5 minutes)

---

## Step 5: Update Environment Variables

After domain is verified, update these in Vercel:

### 5.1 Update in Vercel Dashboard

1. Go to: Settings → Environment Variables
2. Update or add:

```bash
NEXTAUTH_URL=https://dealershipai.com
NEXT_PUBLIC_APP_URL=https://dealershipai.com
```

### 5.2 Update Clerk Configuration

1. Go to: [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to: **Settings → Redirect URLs**
4. Add:
   - `https://dealershipai.com/*`
   - `https://www.dealershipai.com/*`
5. Update **Sign-in URL**: `https://dealershipai.com/sign-in`
6. Update **Sign-up URL**: `https://dealershipai.com/sign-up`

### 5.3 Redeploy After Environment Variable Changes

```bash
# Trigger new deployment
git commit --allow-empty -m "Update environment variables for custom domain"
git push origin main
```

Or manually redeploy in Vercel Dashboard.

---

## Step 6: Verify Domain Works

### 6.1 Test Domain Resolution

```bash
# Test HTTP access
curl -I https://dealershipai.com

# Should return HTTP 200
```

### 6.2 Test SSL Certificate

```bash
# Check SSL
openssl s_client -connect dealershipai.com:443 -servername dealershipai.com

# Or use online tool:
# https://www.ssllabs.com/ssltest/
```

**Expected:** Grade A or A+ SSL certificate

### 6.3 Test Landing Page

1. Open: `https://dealershipai.com`
2. Verify page loads correctly
3. Check browser console for errors
4. Test instant analyzer functionality

### 6.4 Test API Endpoints

```bash
# Health check
curl https://dealershipai.com/api/health

# Orchestrator
curl https://dealershipai.com/api/orchestrator?dealerId=test
```

---

## Step 7: Set Up Redirects (Optional but Recommended)

### 7.1 WWW to Non-WWW (or vice versa)

In `vercel.json` or Next.js config:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.dealershipai.com"
        }
      ],
      "destination": "https://dealershipai.com/:path*",
      "permanent": true
    }
  ]
}
```

---

## Step 8: Update Documentation

After domain is live, update:

1. **README.md** - Update all URLs
2. **API Documentation** - Update base URLs
3. **Marketing Materials** - Update links
4. **Social Media** - Update profile links

---

## 🐛 Troubleshooting

### Issue: Domain Not Resolving

**Solution:**
1. Verify DNS records are correct
2. Wait longer for propagation (can take up to 48 hours)
3. Check DNS with: `dig dealershipai.com @8.8.8.8`
4. Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)

### Issue: SSL Certificate Not Issuing

**Solution:**
1. Verify DNS is correctly configured
2. Wait 10-15 minutes (Vercel auto-issues SSL)
3. Check Vercel dashboard for SSL status
4. Contact Vercel support if issues persist

### Issue: Mixed Content Errors

**Solution:**
1. Ensure all resources use HTTPS
2. Update any hardcoded HTTP URLs to HTTPS
3. Check Content Security Policy headers

### Issue: Domain Takes Too Long to Verify

**Solution:**
1. Double-check DNS records match exactly
2. Some registrars have delays (up to 48 hours)
3. Contact your registrar support if needed

---

## ✅ Success Checklist

- [ ] Domain added in Vercel dashboard
- [ ] DNS records configured at registrar
- [ ] DNS propagation complete (verified with `dig`)
- [ ] SSL certificate issued (green lock in browser)
- [ ] Domain resolves: `https://dealershipai.com` loads
- [ ] Environment variables updated
- [ ] Clerk redirect URLs updated
- [ ] API endpoints accessible via custom domain
- [ ] No mixed content errors
- [ ] Landing page loads correctly
- [ ] Authentication works with custom domain

---

## 📞 Support

**Vercel Support:**
- Dashboard → Help → Contact Support
- Or: [support@vercel.com](mailto:support@vercel.com)

**Domain Registrar Support:**
- Contact your domain registrar's support

---

**Estimated Completion Time:** 15-60 minutes (depending on DNS propagation)  
**Next Step:** After domain is live, proceed with environment variable updates and testing.
