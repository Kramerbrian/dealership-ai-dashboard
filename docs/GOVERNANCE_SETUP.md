# DealershipAI UX Doctrine Governance Setup

## Overview

This system provides automated validation, normalization, and governance reporting for the DealershipAI UX Doctrine.

## Components

### 1. Weekly Validator (`ux_doctrine_validator.yml`)
- Runs every Monday at 06:00 UTC
- Validates and self-heals doctrine YAML/JSON files
- Auto-commits normalized versions
- Posts Slack notifications with KPIs

### 2. Monthly Summary Report (`ux_doctrine_monthly_summary.yml`)
- Runs on the 1st of every month at 07:00 UTC
- Generates Markdown governance report
- Converts to PDF
- Sends email to stakeholders via SendGrid
- Archives reports in repository

## Setup Instructions

### Required Secrets

Add these to your GitHub repository (`Settings → Secrets and variables → Actions`):

1. **SLACK_WEBHOOK_URL**
   - Create a Slack Incoming Webhook
   - Target channel: `#ux-governance` or `#ai-orchestration`

2. **SENDGRID_API_KEY** (optional, for email reports)
   - Create SendGrid account
   - Generate API key
   - Verify sender email (`bot@dealershipai.com`)

3. **TO_EMAIL** (optional, can be set in workflow)
   - Default: `ux-governance@dealershipai.com`
   - Can be comma-separated list

### File Structure

```
.
├── configs/
│   └── ux/
│       └── DealershipAI_Design_Doctrine_v1.0.yaml
├── scripts/
│   ├── dealershipai_doctrine_selfheal_autocommit.py
│   └── generate_monthly_report.py
├── .github/
│   └── workflows/
│       ├── ux_doctrine_validator.yml
│       └── ux_doctrine_monthly_summary.yml
└── governance_reports/
    ├── doctrine_monthly_summary.md
    └── pdf/
        └── doctrine_monthly_summary.pdf
```

## Testing

### Test Validator Locally

```bash
python scripts/dealershipai_doctrine_selfheal_autocommit.py \
  configs/ux/DealershipAI_Design_Doctrine_v1.0.yaml --no-commit
```

### Test Monthly Report Locally

```bash
python scripts/generate_monthly_report.py \
  governance_reports/doctrine_monthly_summary.md 30
```

### Manual Workflow Triggers

1. Go to `Actions` tab in GitHub
2. Select `DealershipAI UX Doctrine Validator`
3. Click `Run workflow` → `Run workflow`

## Output

### Weekly Validator
- Normalized doctrine file (if changes needed)
- Slack notification with:
  - Version
  - Fixes applied
  - Validation log snippet

### Monthly Report
- Markdown report: `governance_reports/doctrine_monthly_summary.md`
- PDF report: `governance_reports/pdf/doctrine_monthly_summary.pdf`
- Email to stakeholders (if SendGrid configured)
- Slack notification
- GitHub Actions artifacts (90-day retention)

## Customization

### Change Report Frequency

Edit `.github/workflows/ux_doctrine_monthly_summary.yml`:

```yaml
schedule:
  - cron: "0 7 1 * *"   # 1st of month, 07:00 UTC
```

### Change Email Recipients

Edit workflow environment variables:

```yaml
env:
  TO_EMAIL: "team@dealershipai.com,compliance@dealershipai.com"
```

### Customize Report Template

Edit `scripts/generate_monthly_report.py` to add more metrics or sections.

## Troubleshooting

### Validator Not Running
- Check GitHub Actions permissions
- Verify cron syntax
- Check workflow logs for errors

### Email Not Sending
- Verify `SENDGRID_API_KEY` secret is set
- Check SendGrid sender verification
- Review workflow logs for API errors

### PDF Generation Fails
- Ensure `wkhtmltopdf` is installed (automated in workflow)
- Check Markdown syntax
- Verify file permissions

## Compliance

This governance system provides:
- ✅ Automated schema validation
- ✅ Self-healing normalization
- ✅ Transparent audit trail
- ✅ Monthly compliance reports
- ✅ Version-controlled documentation
- ✅ Stakeholder notifications

Perfect for SOC2, ISO27001, and investor due diligence.

