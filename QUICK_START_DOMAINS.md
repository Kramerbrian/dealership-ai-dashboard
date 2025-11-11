# ⚡ Quick Start: Add Domains (3 Steps)

Your Vercel dashboard is now open at:
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

---

## Step 1: Get Verification Token (30 seconds)

In the Vercel Dashboard that just opened:

1. Click **"Add Domain"**
2. Type: `dealershipai.com`
3. Copy the verification string (looks like: `vc-domain-verify=dealershipai.com,abc123...`)

---

## Step 2: Add TXT Record to Squarespace (2 minutes)

1. Go to: https://account.squarespace.com/domains
2. Click: **dealershipai.com** → **Advanced Settings** → **DNS Settings**
3. Click: **Add Record**
4. Enter:
   - **Type:** TXT
   - **Host:** `_vercel`
   - **Value:** [paste the verification string from step 1]
   - **TTL:** 3600 (or leave default)
5. Click: **Save**

---

## Step 3: Run Automated Setup (1 command)

Once you've added the TXT record, run this script:

```bash
./scripts/complete-domain-setup.sh
```

This script will:
- ✅ Check DNS propagation (waits automatically)
- ✅ Add all 3 domains via Vercel CLI
- ✅ Guide you through WWW redirect setup
- ✅ Test all endpoints
- ✅ Verify SSL certificates

**That's it!** The script handles everything else.

---

## Manual Check (Optional)

If you prefer to check manually:

```bash
# Check TXT record propagation
./scripts/check-domain-verification.sh

# Once TXT shows up, add all domains
./scripts/add-all-domains.sh
```

---

## Timeline

| Step | Time |
|------|------|
| Get token | 30 sec |
| Add TXT record | 2 min |
| DNS propagation | 5-15 min (automated) |
| Add domains | 1 min (automated) |
| SSL provisioning | 1-5 min (automatic) |
| **Total** | **15-25 minutes** |

---

## After Setup

Test your live domains:

```bash
curl -I https://dealershipai.com
curl -I https://dash.dealershipai.com
curl https://dealershipai.com/api/health
```

---

## Need Help?

- **Detailed Guide:** [DOMAIN_VERIFICATION_GUIDE.md](DOMAIN_VERIFICATION_GUIDE.md)
- **Full Status:** [FINAL_DEPLOYMENT_STATUS.md](FINAL_DEPLOYMENT_STATUS.md)
- **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains

---

**Ready?** Start with Step 1 in the Vercel dashboard that's now open!
