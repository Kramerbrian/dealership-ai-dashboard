# 🌐 DNS Configuration for dealershipai-app.com

## Quick Fix: Add A Record (Fastest)

### Step 1: Log into your DNS provider
- Common providers: GoDaddy, Namecheap, Cloudflare, AWS Route53, etc.
- Find the domain: `dealershipai-app.com`

### Step 2: Add A Record
- **Type**: A
- **Name**: `dealershipai-app.com` (or `@`)
- **Value**: `76.76.21.21`
- **TTL**: 3600 (or leave default)

### Step 3: Wait for DNS Propagation
- Usually takes 5-60 minutes
- Check with: `nslookup dealershipai-app.com`
- Or use: https://dnschecker.org

### Step 4: Verify in Vercel
```bash
npx vercel domains inspect dealershipai-app.com
```

## Alternative: Change Nameservers (More Control)

### Nameservers to use:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Benefits:
- Vercel manages all DNS records automatically
- Better for multiple subdomains
- Easier SSL management

---

## Current Status

**Domain**: `dealershipai-app.com` ✅ Added to Vercel
**Project**: `dealership-ai-dashboard` ✅ Linked
**DNS**: ⏳ Waiting for configuration
**SSL**: ⏳ Waiting for DNS verification

## Next Steps

1. Add DNS records (instructions above)
2. Wait 5-60 minutes for propagation
3. Vercel will automatically create SSL certificate
4. Access: `https://dealershipai-app.com`
