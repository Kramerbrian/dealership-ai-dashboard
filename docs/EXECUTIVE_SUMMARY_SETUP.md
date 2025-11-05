# 📊 Group Executive Summary Setup Guide

## ✅ Implementation Complete

The **GroupExecutiveSummary** component is now integrated into the dashboard at `/dashboard/compare`.

## Features

- **Multi-rooftop aggregation**: Fetches KPI scores for all dealerships in the group
- **AI-generated insights**: Automatically generates executive-friendly summaries
- **Slack/Email integration**: One-click dispatch to Slack or email
- **Real-time updates**: Automatically refreshes data on load

## Configuration

### Required Environment Variables

Add these to your `.env.local` and Vercel:

#### Slack Integration (Optional)
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Email Integration (Optional)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EXECUTIVE_EMAIL=executives@dealershipgroup.com
```

### Setting Up Slack Webhook

1. Go to https://api.slack.com/apps
2. Create a new app or select existing app
3. Navigate to **Incoming Webhooks**
4. Activate Incoming Webhooks
5. Click **Add New Webhook to Workspace**
6. Select channel (e.g., `#executive-reports`)
7. Copy webhook URL → Add to environment variables

### Setting Up Email (Resend)

1. Sign up at https://resend.com
2. Create API key
3. Verify domain `dealershipai.com`
4. Add `RESEND_API_KEY` to environment variables
5. Set `EXECUTIVE_EMAIL` to recipient address

## Usage

### Accessing the Executive Summary

1. Navigate to `/dashboard/compare`
2. The **Group Executive Summary** section appears below the comparison dashboard
3. Review the automatically generated summary
4. Click **Send to Slack** or **Email Digest** to dispatch

### Example Output

```
Group Summary for 4 rooftops:

• Average scores — AIV 79, ATI 76, CVI 88, ORI 68, GRI 82, DPI 80.

• Top performers:
  - AIV: Germain Nissan of Naples (82)
  - ATI: Germain Honda of Dublin (81)
  - CVI: Germain Toyota of Naples (92)
  - ORI: Germain Ford of Beavercreek (74)
  - GRI: Germain Nissan of Naples (85)
  - DPI: Germain Nissan of Naples (83)

• Lowest overall consistency: Germain Ford of Beavercreek in ORI. 
  Recommend targeted training and Auto-Fix deployment.

• Observed trend: Dealers with strong GRI (automation & process) 
  maintain 10–15pt higher CVI. Focus on CRM cleanup and schema 
  automation to replicate high performers.
```

## Customization

### Adding More Dealers

Edit `components/GroupExecutiveSummary.tsx`:

```typescript
const DEALERS = [
  { id: "dealer-1", name: "Dealer Name", domain: "dealer.com" },
  // Add more dealers here
];
```

### Modifying Summary Logic

The `generatePortfolioSummary()` function in `GroupExecutiveSummary.tsx` can be customized to:
- Add more metrics
- Change insight generation logic
- Include revenue projections
- Add trend analysis

## API Endpoints

### `/api/send-digest` (POST)

Sends executive summary to Slack or email.

**Request:**
```json
{
  "summary": "Group Summary for 4 rooftops...",
  "channel": "slack" | "email"
}
```

**Response:**
```json
{
  "status": "sent",
  "channel": "slack"
}
```

## Troubleshooting

### Summary not loading?

- Check that `/api/ai-scores` endpoint is working
- Verify dealer domains are accessible
- Check browser console for errors

### Slack/Email not sending?

- Verify environment variables are set in Vercel
- Check API route logs: `/api/send-digest`
- For Slack: Verify webhook URL is correct
- For Email: Verify Resend API key is valid

## Next Steps

Consider adding:
- **Forecast Mode**: Project next-month AIV/ATI/CVI based on trajectory
- **Scheduled Reports**: Daily/weekly automatic digests via cron
- **Custom Recipients**: Allow executives to add their own email addresses
- **PDF Export**: Generate formatted PDF reports
- **Historical Trends**: Show month-over-month comparisons

