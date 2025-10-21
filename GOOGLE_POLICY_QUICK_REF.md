# Google Policy Compliance - Quick Reference

## 🚀 Quick Start

### 1. Run Batch Audit
```bash
curl -X POST http://localhost:3000/api/audit/google-pricing \
  -H "Content-Type: application/json" \
  -d '[{"adUrl":"...","lpUrl":"...","vdpUrl":"..."}]'
```

### 2. Export CSV Report
```bash
curl -X POST "http://localhost:3000/api/audit/google-pricing?format=csv" \
  -H "Content-Type: application/json" \
  -d '[...]' -o report.csv
```

### 3. Test Locally
```bash
npx ts-node scripts/test-google-policy-compliance.ts
```

---

## 📊 Risk Score Thresholds

| Score | Level | Action |
|-------|-------|--------|
| 0-20 | ✅ Low | Monitor |
| 20-40 | ⚠️  Moderate | Review |
| 40-70 | 🔴 High | Fix ASAP |
| 70+ | ❌ Critical | Urgent |

---

## 🎯 Scoring Formula

```
Risk Score = (1 - Jaccard) × 30
           + PriceDelta/100 × 30
           + (100 - DisclosureScore) × 0.25
           + HiddenFees × 15
```

---

## 📋 ATI Impact

| Violation | Pillar | Penalty |
|-----------|--------|---------|
| Jaccard < 30% | Consistency | -15 pts |
| Jaccard 30-50% | Consistency | -5 pts |
| Price mismatch | Consistency | -5 to -15 pts |
| Disclosure < 70 | Precision | -10 pts |
| Hidden fees | Precision | -15 pts |

---

## ✅ Compliance Checklist

### Ad Copy
- [ ] Prices match LP/VDP exactly
- [ ] APR disclosed for payment offers
- [ ] Term disclosed for payment offers
- [ ] Down payment disclosed
- [ ] "Qualified buyers" disclaimer
- [ ] No "$0 down" without fee disclosure

### Landing Page
- [ ] Offers match ad copy (Jaccard > 50%)
- [ ] All fees itemized
- [ ] Disclosures prominent (not buried)
- [ ] CTA doesn't make new claims

### VDP
- [ ] Price matches ad/LP
- [ ] MSRP accurate (if shown)
- [ ] All fees listed
- [ ] No hidden dealer prep charges

---

## 🔧 Quick Fixes

### Price Mismatch
```typescript
// ❌ Bad
Ad: "$299/mo"
VDP: "$349/mo"

// ✅ Good
Ad: "$349/mo"
VDP: "$349/mo"
```

### Missing Disclosure
```typescript
// ❌ Bad
"Lease from $299/mo"

// ✅ Good
"Lease from $299/mo. 36 mo, $2,995 down, 3.9% APR. Qualified buyers."
```

### Hidden Fees
```typescript
// ❌ Bad
Ad: "$25,000" (+ $800 hidden fees on VDP)

// ✅ Good
Ad: "$25,000 + fees" with itemized fees on LP
```

---

## 📈 Weekly CRON

**Setup:**
1. Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/policy-drift",
       "schedule": "0 9 * * 1"
     }]
   }
   ```

2. Set env var:
   ```bash
   CRON_SECRET=your-random-secret
   ```

3. Deploy to Vercel

**Manual Trigger:**
```bash
curl -X POST http://localhost:3000/api/cron/policy-drift
```

---

## 🎨 Dashboard Card

**Location:** `/app/intelligence/page.tsx`

**Displays:**
- Risk Score (0-100)
- Offer Integrity (Jaccard %)
- Disclosure Score (0-100)
- ATI Impact (-X pts)
- Violations (critical/warning)
- Trend (week-over-week)

**Colors:**
- Green: Risk < 20
- Yellow: Risk 20-40
- Orange: Risk 40-70
- Red: Risk 70+

---

## 🔐 Environment Variables

```bash
ANTHROPIC_API_KEY=sk-...        # Optional: Claude-powered analysis
CRON_SECRET=<random-secret>     # Required: CRON auth
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `lib/compliance/google-pricing-policy.ts` | Core detection engine |
| `lib/compliance/ati-policy-integration.ts` | ATI penalty calculator |
| `lib/compliance/policy-drift-monitor.ts` | Policy update detector |
| `app/api/audit/google-pricing/route.ts` | Batch audit API |
| `app/api/cron/policy-drift/route.ts` | CRON endpoint |
| `components/Intelligence/GooglePolicyComplianceCard.tsx` | Dashboard UI |

---

## 🆘 Common Issues

### "CRON_SECRET not configured"
**Fix:** Set `CRON_SECRET` in Vercel env vars

### "Unauthorized CRON request"
**Fix:** Ensure CRON job sends `Authorization: Bearer <CRON_SECRET>`

### Dashboard shows "Error"
**Fix:** Replace mock data in `GooglePolicyComplianceCard.tsx` with API call

### Risk score too high
**Fix:**
1. Check price parity across all channels
2. Review disclosure completeness
3. Itemize all fees
4. Improve ad/LP copy consistency

---

## 💡 Best Practices

1. **Run audits weekly** during normal campaigns
2. **Run audits daily** during high-volume campaigns
3. **Fix critical violations** within 24 hours
4. **Monitor ATI drop** - if >10 pts, investigate immediately
5. **Document all fixes** for compliance review
6. **Train ad creators** on disclosure requirements

---

**Last Updated:** 2025-10-20
**Version:** 1.0.0
