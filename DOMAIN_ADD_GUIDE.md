# Adding dealershipai.com to Vercel Account

## Current Issue
- `dealershipai.com` is NOT in your Vercel account
- Nameservers already point to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
- Cannot add DNS records or subdomain until root domain is verified/added

## Solution: Add via Vercel Dashboard

### Step 1: Add Root Domain
1. Go to: https://vercel.com/dashboard
2. Select project: `dealership-ai-dashboard`
3. Navigate to: **Settings → Domains**
4. Click: **"Add Domain"**
5. Enter: `dealershipai.com`
6. Choose verification method:
   - **DNS Verification** (if prompted, add TXT record)
   - **Nameserver Verification** (should auto-verify since nameservers are Vercel)
   - **Email Verification** (check domain owner email)

### Step 2: Once Domain is Added
Once `dealershipai.com` appears in your domains list, run:

```bash
# Add DNS record for subdomain
npx vercel dns add dealershipai.com dash CNAME cname.vercel-dns.com

# Add subdomain to project
npx vercel domains add dash.dealershipai.com
```

## Alternative: Check if Domain is in Different Account
If the domain was previously configured, it might be in:
- A different Vercel team
- A personal vs. team account
- Needs to be transferred

Check: https://vercel.com/dashboard → Domains (all teams)

## Quick Verification
After adding in dashboard, verify with:
```bash
npx vercel domains ls
```

Should show: `dealershipai.com` in the list

