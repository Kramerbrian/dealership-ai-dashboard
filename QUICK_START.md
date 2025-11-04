# 🚀 Quick Start Guide

## 1. Generate Audit Reports

### Basic Usage
```bash
node scripts/generate-report.js
```

### With Google PageSpeed API Key
```bash
GOOGLE_PAGESPEED_API_KEY=your_key node scripts/generate-report.js
```

**Output:**
- `public/audit-reports/abtest_metrics.csv` - CSV data
- `public/audit-reports/abtest_report.pdf` - PDF report

---

## 2. Test Dashboard

### Start Dev Server
```bash
npm run dev
```

### Visit Dashboard
Open in browser:
```
http://localhost:3000/dashboard
```

**What to Check:**
- ✅ Dashboard loads without errors
- ✅ Tabs navigate correctly (Overview, AI Health, Website, etc.)
- ✅ Cognitive Dashboard modal opens
- ✅ HAL-9000 chatbot works
- ✅ Data displays from API

---

## 3. View Audit Reports

### Access Audit Viewer
Open in browser:
```
http://localhost:3000/admin/audit
```

**Features:**
- 📊 Live metrics table
- 📈 CTR vs Conversion chart
- 📥 CSV download
- 📄 PDF download
- 📜 Historical reports

---

## 4. Configure Analytics

### Quick Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Add analytics credentials (see `ANALYTICS_CONFIG.md`):
   ```bash
   # Google PageSpeed Insights
   GOOGLE_PAGESPEED_API_KEY=your_key
   
   # Google Analytics 4
   GA_PROPERTY_ID=123456789
   GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account",...}'
   
   # OR Mixpanel
   NEXT_PUBLIC_MIXPANEL_TOKEN=your_token
   
   # OR Segment
   NEXT_PUBLIC_SEGMENT_KEY=your_key
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

4. Test analytics:
   ```bash
   curl http://localhost:3000/api/analytics/variant?variant=fear&range=30d
   ```

5. Regenerate reports:
   ```bash
   node scripts/generate-report.js
   ```

---

## Testing Checklist

### ✅ Report Generation
- [ ] Run `node scripts/generate-report.js`
- [ ] Verify CSV and PDF files created
- [ ] Check `public/audit-reports/` directory

### ✅ Dashboard
- [ ] Visit `http://localhost:3000/dashboard`
- [ ] Test all tabs
- [ ] Open Cognitive Dashboard modal
- [ ] Test HAL-9000 chatbot

### ✅ Audit Viewer
- [ ] Visit `http://localhost:3000/admin/audit`
- [ ] Verify metrics table displays
- [ ] Check chart renders
- [ ] Test CSV download
- [ ] Test PDF download

### ✅ Analytics Integration
- [ ] Add credentials to `.env.local`
- [ ] Test analytics API endpoint
- [ ] Verify real data in reports
- [ ] Check CTR/Conversion rates

---

## Common Commands

```bash
# Generate reports
node scripts/generate-report.js

# Start dev server
npm run dev

# Test analytics API
curl http://localhost:3000/api/analytics/variant?variant=fear&range=30d

# Test PIQR API
curl http://localhost:3000/api/piqr?dealerId=current&range=30d

# View audit history
curl http://localhost:3000/api/audit-history
```

---

## Troubleshooting

### Dashboard shows "Internal Server Error"
- Check browser console for errors
- Verify API endpoints are responding
- Check authentication state

### Reports show zero values
- Add `GOOGLE_PAGESPEED_API_KEY` for Lighthouse data
- Add analytics credentials for CTR/Conversion data

### Analytics returns simulated data
- Verify credentials in `.env.local`
- Restart dev server after adding credentials
- Check API endpoint response

---

## Next Steps

1. ✅ Test dashboard
2. ✅ View audit reports
3. ✅ Configure analytics
4. ⏳ Add Slack alerts (see `NEXT_STEPS.md`)
5. ⏳ Verify CI/CD integration
