# Audit Report Generation Script

## Usage

### Generate Audit Report

```bash
node scripts/generate-report.js
```

### Environment Variables

Set these in your `.env.local` or CI/CD environment:

```bash
# Optional: Google PageSpeed Insights API Key
GOOGLE_PAGESPEED_API_KEY=your_api_key_here

# Optional: Base URL for testing (defaults to https://dealershipai.com)
NEXT_PUBLIC_APP_URL=https://dealershipai.com
# or
APP_URL=https://dealershipai.com
```

### Output

The script generates:
- `public/audit-reports/abtest_metrics.csv` - CSV data file
- `public/audit-reports/abtest_report.pdf` - PDF report (or HTML if Puppeteer fails)

### Requirements

Install dependencies:
```bash
npm install puppeteer
```

### CI/CD Integration

Used in GitHub Actions workflow (`.github/workflows/abtest-deploy.yml`):

```yaml
- name: Generate Audit Report
  run: node scripts/generate-report.js
  env:
    GOOGLE_PAGESPEED_API_KEY: ${{ secrets.GOOGLE_PAGESPEED_API_KEY }}
```

### Notes

- The script fetches metrics from Google PageSpeed Insights for each variant
- CTR and Conversion data are currently simulated (replace with actual analytics API)
- If Puppeteer fails, an HTML version is saved instead
- The script handles errors gracefully and continues with default values if API calls fail

