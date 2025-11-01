# Testing Guide - Fleet Agent Integration

Complete testing checklist for all fleet agent components.

## 1. Test Free Audit Widget

### Add to Landing Page
The `FreeAuditWidget` component has been created. To integrate it:

**Option A: Replace existing scan form**
```tsx
// app/page.tsx
import FreeAuditWidget from '@/components/landing/FreeAuditWidget';

// Replace the existing form section with:
<FreeAuditWidget />
```

**Option B: Add as additional section**
```tsx
// Add after the hero section
<section className="my-16">
  <FreeAuditWidget />
</section>
```

### Test Steps
1. Navigate to landing page: `https://dealershipai.com`
2. Enter a test domain: `https://www.exampledealer.com`
3. Click "Run Audit"
4. Verify:
   - Loading state appears
   - Results display with scores
   - CTAs are clickable
   - Error handling works (try invalid URL)

### Expected Behavior
- Widget loads without errors
- API call to `/api/ai-scores` succeeds
- Results show:
  - AI Visibility (OCI) percentage
  - Zero-Click Inclusion rate
  - Schema/Trust Signals
  - Recommended fixes list

## 2. Test Fleet Dashboard

### Access Dashboard
1. Sign in via Clerk: `/sign-in`
2. Navigate to: `/fleet`

### Verify
- Page loads without errors
- Table structure displays correctly
- If no data: Shows "No rooftops found" message
- If data exists: Shows origin, metrics, and actions
- "Refresh" buttons work (will require fleet API)

### Expected Columns
- Origin (website URL)
- AI Vis % (AI visibility score)
- Schema % (Schema coverage)
- UGC (User-generated content health)
- Revenue-at-Risk (financial impact)
- Last Refresh (timestamp)
- Actions (Refresh button)

## 3. Test Cron Jobs

### Manual Trigger
```bash
# Replace with your actual values
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/fleet-refresh
```

### Expected Response
```json
{
  "ok": true,
  "queued": 150,
  "total": 150,
  "when": "2025-01-15T12:00:00.000Z"
}
```

### Error Cases
- **401 Unauthorized:** Check `CRON_SECRET` matches
- **500 Error:** Verify `FLEET_API_BASE` is set
- **Empty origins:** Normal if fleet API has no data

### Verify in Vercel Dashboard
1. Go to **Settings** → **Cron Jobs**
2. Verify three jobs are scheduled:
   - `/api/cron/fleet-refresh` at 08:00 ET
   - `/api/cron/fleet-refresh` at 12:00 ET
   - `/api/cron/fleet-refresh` at 16:00 ET

## 4. Test Bulk Origins Ingestion

### Create Sample CSV
Create `data/dealers.csv`:
```csv
https://www.dealer1.com
https://www.dealer2.com
https://www.dealer3.com
dealer4.com
dealer5.com
```

### Run Seed Script
```bash
# Ensure environment variables are set in .env.local
node scripts/seed-origins.mjs ./data/dealers.csv
```

### Verify
- Script executes without errors
- Origins are normalized (http:// added if missing)
- API call to `/api/origins/bulk` succeeds
- Check fleet dashboard to see new origins

### Expected Output
```
📋 Found 5 origins to seed
✅ Bulk ingest complete: { ok: true, ... }
```

## 5. Test AI Scores Proxy

### Direct API Test
```bash
curl "https://your-app.vercel.app/api/ai-scores?origin=https://example.com"
```

### Expected Response
```json
{
  "timestamp": "2025-01-15T12:00:00.000Z",
  "dealerId": "",
  "model_version": "3.0.0",
  "kpi_scoreboard": {
    "QAI_star": 0.78,
    "VAI_Penalized": 0.85,
    "PIQR": 0.92,
    "HRP": 0.12,
    "OCI": 0.73
  },
  "platform_breakdown": [...],
  "zero_click_inclusion_rate": 0.42
}
```

### Cache Verification
- First request: Hits fleet API
- Subsequent requests (within 3 min): Returns cached data
- Check response headers for cache status

## 6. Test Auto-Fix Engine

### Manual Test
Create a test script `test-auto-fix.ts`:
```typescript
import { runAutoFix } from '@/lib/auto-fix/engine';

const result = await runAutoFix({
  origin: 'https://test-dealer.com',
  kind: 'AutoDealer',
  schemaData: {
    name: 'Test Dealer',
    address: '123 Main St',
  },
});

console.log(result);
```

### Expected Output
```json
{
  "ok": true,
  "version_id": "v123456"
}
```

### Verification Hooks (Future)
- Perplexity probe to verify schema visibility
- Rich Results Test API validation
- Audit log entry creation

## 7. Test Status Endpoint

```bash
curl https://your-app.vercel.app/api/status
```

### Expected Response
```json
{
  "ok": true,
  "ts": "2025-01-15T12:00:00.000Z",
  "service": "dealershipAI_fleet_agent",
  "version": "3.0.0",
  "platform": "CognitiveOps"
}
```

## 8. Integration Testing Checklist

- [ ] Free Audit Widget renders on landing page
- [ ] Widget can scan a domain successfully
- [ ] Fleet dashboard loads after authentication
- [ ] Fleet dashboard shows data (or graceful empty state)
- [ ] Cron job can be manually triggered
- [ ] Cron job authenticates correctly
- [ ] Bulk origins script executes successfully
- [ ] AI scores proxy returns cached data
- [ ] Redis connection works (check logs)
- [ ] All API routes return proper headers
- [ ] Error handling works for all edge cases

## Troubleshooting

### Common Issues

**Widget doesn't load:**
- Check browser console for errors
- Verify `/api/ai-scores` route exists
- Check network tab for failed requests

**Fleet dashboard empty:**
- Verify `FLEET_API_BASE` is set
- Check `X_API_KEY` is correct
- Look for CORS errors in console

**Cron job fails:**
- Verify `CRON_SECRET` matches exactly
- Check Vercel cron configuration
- Review deployment logs

**Redis errors:**
- Verify Upstash credentials
- Check Redis instance is active
- Ensure correct region

## Next Steps

After successful testing:
1. Add FreeAuditWidget to production landing page
2. Monitor cron job executions in Vercel
3. Set up alerts for cron job failures
4. Configure auto-scaling for fleet API if needed
5. Set up monitoring dashboard for fleet metrics

