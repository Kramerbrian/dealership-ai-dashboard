# Deployment Verification Guide

## ✅ Changes Deployed

The following commits have been pushed to production:

1. **`391c5eecf`** - docs: Add scoring integration documentation
2. **`be46173d7`** - feat: Wire scoring to endpoints, connect consensus to auto-fix, add tile access test

## 🔍 Verify Deployment

### 1. Check Vercel Deployment Status

Visit: https://vercel.com/[your-team]/dealership-ai-dashboard/deployments

Or use Vercel CLI:
```bash
vercel ls --limit=1
```

### 2. Test Scoring Integration

```bash
# Test clarity stack with new scoring
curl "https://dash.dealershipai.com/api/clarity/stack?domain=test.com" | jq '.scores, .alert_bands'

# Test market pulse with new scoring
curl "https://dash.dealershipai.com/api/marketpulse/compute?domain=test.com" | jq '.aiv, .aivAlert'
```

**Expected Response:**
- `scores.seo`, `scores.aeo`, `scores.geo` should be calculated using new formulas
- `alert_bands` should show green/yellow/red for each metric
- `aivAlert` should show alert band for AI Visibility

### 3. Test Tile Access Control

```bash
# Test Tier 1 user
curl "https://dash.dealershipai.com/api/test/tile-access?tier=1&role=dealer_user" | jq '.availableTiles'

# Test Tier 3 marketing director
curl "https://dash.dealershipai.com/api/test/tile-access?tier=3&role=marketing_director" | jq '.availableTiles, .summary'
```

**Expected Response:**
- Tier 1 users should see: `intel`, `site`
- Tier 3 marketing_director should see: `intel`, `site`, `inventory`, `traffic`, `agents`, `apis`, `mystery`

### 4. Test Consensus Auto-Fix

The auto-fix endpoint now checks consensus before executing. To test:

1. Create a pulse card with `issueHits` containing unanimous consensus (3/3 engines)
2. Call `/api/pulse/[id]/fix` - should auto-fix
3. Create a pulse card with majority (2/3) or weak (1/3) consensus
4. Call `/api/pulse/[id]/fix` - should return `requiresApproval: true`

## 📊 Monitor Deployment

### Check Build Logs

```bash
# Get latest deployment
vercel inspect [deployment-url]

# Or check in Vercel dashboard
# https://vercel.com/[your-team]/dealership-ai-dashboard/deployments
```

### Check Function Logs

```bash
# View function logs
vercel logs [deployment-url] --follow
```

## ⚠️ Known Issues

1. **Dependency Vulnerabilities**: GitHub Dependabot found 19 vulnerabilities
   - 1 critical, 6 high, 10 moderate, 2 low
   - Address separately: https://github.com/Kramerbrian/dealership-ai-dashboard/security/dependabot

2. **Uncommitted Changes**: Some files in working directory are not committed
   - These are separate from the scoring integration
   - Can be committed separately if needed

## ✅ Success Criteria

- [ ] Vercel deployment completes successfully
- [ ] `/api/clarity/stack` returns scores with `alert_bands`
- [ ] `/api/marketpulse/compute` returns `aivAlert`
- [ ] `/api/test/tile-access` returns correct tiles for each tier/role
- [ ] Auto-fix only executes on unanimous consensus issues

## 🚀 Next Steps

1. Monitor deployment in Vercel dashboard
2. Test endpoints after deployment completes
3. Verify scoring calculations match expected values
4. Test tile access control in dashboard UI
5. Monitor auto-fix behavior in production

---

**Deployment Time**: Check Vercel dashboard for exact deployment time
**Status**: ✅ Pushed to GitHub, awaiting Vercel deployment

