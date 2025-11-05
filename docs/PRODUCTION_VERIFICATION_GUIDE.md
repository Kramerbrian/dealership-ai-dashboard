# 🚀 Production Verification Guide

## Quick Verification Commands

### 1. Verify Environment Variables
```bash
npm run verify:production
```

### 2. Test Pricing Page Features
```bash
npm run test:pricing
```

### 3. Test Redis Pub/Sub
```bash
npm run test:redis
```

### 4. Test SSE Stream
```bash
npm run test:sse
```

### 5. Run All Checks
```bash
bash scripts/production-verification.sh
```

---

## Manual Verification Steps

### ✅ Vercel Environment Variables

**Check in Vercel Dashboard:**
1. Go to: `https://vercel.com/[your-project]/settings/environment-variables`
2. Verify all required variables are set for **Production** environment
3. Check for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `STRIPE_SECRET_KEY` (if using Stripe)
   - `REDIS_URL` (if using Redis Pub/Sub)

**Quick Check:**
```bash
curl https://dealershipai.com/api/health | jq '.services'
```

---

### ✅ Pricing Page Feature Toggles

**Test in Browser:**
1. Visit: `https://dealershipai.com/pricing`
2. Verify:
   - [ ] Tier cards display correctly
   - [ ] "Borrow a Pro feature" button visible for Tier 1
   - [ ] ROI projections display
   - [ ] Risk reversal badges show
   - [ ] Visibility gain badges appear

**Test Trial Grant:**
```bash
curl -X POST https://dealershipai.com/api/trial/grant \
  -H "Content-Type: application/json" \
  -d '{"feature_id":"schema_fix","user_id":"test"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "feature_id": "schema_fix",
    "expires_at": "2025-01-16T...",
    "hours_remaining": 24
  }
}
```

**Test Trial Status:**
```bash
curl https://dealershipai.com/api/trial/status
```

**Expected Response:**
```json
{
  "active": ["schema_fix"]
}
```

---

### ✅ Redis Pub/Sub Events

**Check Redis Status:**
```bash
curl https://dealershipai.com/api/diagnostics/redis
```

**Expected Response:**
```json
{
  "redisUrl": "configured",
  "redisModuleAvailable": true,
  "busStatus": "initialized",
  "status": "configured",
  "message": "Redis Pub/Sub is configured and ready"
}
```

**Test Event Publishing:**
The system automatically publishes events when:
- AI scores are calculated
- MSRP changes are detected
- Score recomputes occur

**Monitor Events:**
```bash
# Check logs for:
# "[events] Redis Pub/Sub initialized successfully"
# "[events] Published event to ai-scores:update"
```

---

### ✅ Real-Time SSE Stream

**Test SSE Connection:**
```javascript
// In browser console or Node.js
const es = new EventSource('https://dealershipai.com/api/realtime/events?dealerId=test');

es.onopen = () => console.log('✅ Connected');
es.onmessage = (e) => console.log('Event:', JSON.parse(e.data));
es.onerror = (e) => console.error('Error:', e);
```

**Expected Events:**
- `{"type":"connected"}` - Initial connection
- `{"type":"ai-score-update"}` - AI score changes
- `{"type":"msrp-change"}` - MSRP updates
- `{"type":"heartbeat"}` - Keep-alive (every 30s)

**Test with curl:**
```bash
curl -N https://dealershipai.com/api/realtime/events?dealerId=test
```

---

## Verification Checklist

### Environment Variables ✅
- [ ] All required variables set in Vercel
- [ ] Production environment selected
- [ ] No missing critical variables
- [ ] Tested with verification script

### API Endpoints ✅
- [ ] `/api/health` - Returns 200 or 503
- [ ] `/api/telemetry` - Accepts POST requests
- [ ] `/api/trial/grant` - Grants trials successfully
- [ ] `/api/trial/status` - Returns active trials
- [ ] `/api/agent/visibility` - Returns AIV context
- [ ] `/api/realtime/events` - SSE stream works
- [ ] `/api/diagnostics/redis` - Reports Redis status

### Pricing Page ✅
- [ ] Page loads without errors
- [ ] Tier cards render correctly
- [ ] Trial grant button functional
- [ ] ROI calculations display
- [ ] Checkout flow works (if Stripe configured)

### Real-Time Features ✅
- [ ] Redis Pub/Sub initialized
- [ ] SSE stream connects
- [ ] Events broadcast correctly
- [ ] Heartbeat keeps connection alive
- [ ] Client disconnect handled gracefully

### Database ✅
- [ ] Supabase connection verified
- [ ] Telemetry table exists
- [ ] Trials table exists
- [ ] RLS policies active

---

## Production Monitoring

### Health Checks
```bash
# Continuous monitoring
watch -n 30 'curl -s https://dealershipai.com/api/health | jq'
```

### Log Monitoring
Monitor Vercel logs for:
- `[events] Redis Pub/Sub initialized successfully`
- `Telemetry event recorded`
- `Trial feature granted`
- Any error messages

### Performance Monitoring
- Check Core Web Vitals in Vercel Analytics
- Monitor API response times
- Track SSE connection stability
- Watch for Redis connection issues

---

## Troubleshooting

### Redis Not Connecting
1. Check `REDIS_URL` in Vercel
2. Verify Redis credentials
3. Check `/api/diagnostics/redis` endpoint
4. Review logs for connection errors

### SSE Stream Not Working
1. Verify authentication (requires Clerk session)
2. Check browser console for errors
3. Verify `/api/realtime/events` endpoint
4. Test with curl to isolate client issues

### Trial Grants Not Working
1. Check Supabase connection
2. Verify `trials` table exists
3. Check RLS policies
4. Review `/api/trial/grant` logs

### Pricing Page Issues
1. Check browser console for errors
2. Verify environment variables
3. Test Stripe configuration (if used)
4. Check network tab for failed requests

---

## Quick Status Check

```bash
# One-liner to check all systems
echo "Health:" && curl -s https://dealershipai.com/api/health | jq '.status' && \
echo "Redis:" && curl -s https://dealershipai.com/api/diagnostics/redis | jq '.status' && \
echo "Pricing:" && curl -s -o /dev/null -w "%{http_code}" https://dealershipai.com/pricing
```

---

## ✅ Production Ready Confirmation

When all checks pass:
- ✅ Health endpoint responding
- ✅ All API endpoints operational
- ✅ Pricing page loads correctly
- ✅ Redis Pub/Sub configured (or fallback working)
- ✅ SSE stream connecting
- ✅ Trial system functional
- ✅ Telemetry tracking active

**Status: 🚀 PRODUCTION READY**

---

**Last Verified**: Auto-generated  
**Next Verification**: After each deployment
