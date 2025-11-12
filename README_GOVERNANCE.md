# DealershipAI UX Doctrine Governance System

## Overview

Automated governance system for DealershipAI UX Doctrine with:
- ✅ Weekly validation and self-healing
- ✅ Monthly compliance reports
- ✅ PDF generation and email distribution
- ✅ Slack notifications
- ✅ Full audit trail

## Quick Start

### 1. Set GitHub Secrets

Go to `Settings → Secrets and variables → Actions`:

- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `SENDGRID_API_KEY` - (Optional) SendGrid API key for email reports

### 2. Verify Doctrine File

Ensure your doctrine file exists:
```
configs/ux/DealershipAI_Design_Doctrine_v1.0.yaml
```

### 3. Workflows Automatically Run

- **Weekly Validator**: Every Monday 06:00 UTC
- **Monthly Report**: 1st of month, 07:00 UTC

## What Gets Generated

### Weekly Validator Output
- Normalized doctrine file (if schema issues found)
- Slack notification with validation results
- Git commit with auto-fixes

### Monthly Report Output
- Markdown report: `governance_reports/doctrine_monthly_summary.md`
- PDF report: `governance_reports/pdf/doctrine_monthly_summary.pdf`
- Email to stakeholders (if SendGrid configured)
- Slack notification
- GitHub Actions artifacts

## Manual Testing

### Test Validator
```bash
python scripts/dealershipai_doctrine_selfheal_autocommit.py \
  configs/ux/DealershipAI_Design_Doctrine_v1.0.yaml --no-commit
```

### Test Monthly Report
```bash
python scripts/generate_monthly_report.py \
  governance_reports/doctrine_monthly_summary.md 30
```

## Files Created

```
scripts/
├── dealershipai_doctrine_selfheal_autocommit.py  # Validator script
└── generate_monthly_report.py                    # Report generator

.github/workflows/
├── ux_doctrine_validator.yml                     # Weekly validator
└── ux_doctrine_monthly_summary.yml               # Monthly report

configs/ux/
└── DealershipAI_Design_Doctrine_v1.0.yaml       # Doctrine file

governance_reports/
├── doctrine_monthly_summary.md                   # Generated monthly
└── pdf/
    └── doctrine_monthly_summary.pdf              # Generated monthly

docs/
└── GOVERNANCE_SETUP.md                           # Detailed setup guide
```

## Compliance Features

- ✅ **Automated Validation**: Schema consistency enforced
- ✅ **Self-Healing**: Missing fields auto-filled
- ✅ **Audit Trail**: All changes version-controlled
- ✅ **Transparent Reporting**: Monthly summaries for stakeholders
- ✅ **Notification System**: Slack + Email alerts
- ✅ **Artifact Retention**: 90-day GitHub Actions artifacts

## Support

See `docs/GOVERNANCE_SETUP.md` for detailed setup instructions and troubleshooting.

## Status

✅ **Ready for Production**

All components are implemented and ready to deploy. Just add the required secrets to enable full functionality.

