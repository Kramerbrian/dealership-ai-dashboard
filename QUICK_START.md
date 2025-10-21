# 🚀 Google Policy Compliance - Quick Start

**5 Minutes to Production**

---

## Right Now (Supabase SQL Editor is open!)

1. **Paste** the migration SQL (already in your clipboard)
2. **Click "Run"** in Supabase SQL Editor
3. **Verify:** Should see success message

---

## Test Locally (2 min)

```bash
# Start dev server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/compliance/google-pricing/summary

# Should return:
# { "riskScore": 0, "compliant": true, ... }
```

---

## Deploy to Production (1 min)

Vercel is already deploying automatically from your GitHub push!

Check status: https://vercel.com/dashboard

---

## Add Optional Notifications

**Resend (Email):**
1. Get API key: https://resend.com/api-keys
2. Add to Vercel: `RESEND_API_KEY=...`

**Slack (Webhook):**
1. Get webhook: https://api.slack.com/messaging/webhooks
2. Add to Vercel: `SLACK_WEBHOOK_URL=...`

---

## Test with Real URLs

```bash
curl -X POST http://localhost:3000/api/audit/google-pricing \
  -H "Content-Type: application/json" \
  -d '[{
    "adUrl": "https://your-dealership.com/ad",
    "lpUrl": "https://your-dealership.com/special",
    "vdpUrl": "https://your-dealership.com/vehicle/123"
  }]'
```

---

## View Dashboard

Visit: http://localhost:3000/intelligence

(After production deployment: https://yourdomain.com/intelligence)

---

## That's It!

✅ Database migrated
✅ Code deployed  
✅ CRON active
✅ Dashboard live

**Next:** Run real audits and watch the compliance metrics roll in!

📚 **Full Docs:** 
- [GOOGLE_POLICY_COMPLIANCE_GUIDE.md](GOOGLE_POLICY_COMPLIANCE_GUIDE.md)
- [GOOGLE_POLICY_PRODUCTION_DEPLOYMENT.md](GOOGLE_POLICY_PRODUCTION_DEPLOYMENT.md)
