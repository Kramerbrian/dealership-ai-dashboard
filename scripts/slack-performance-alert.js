/**
 * Slack Performance Alert Script
 * 
 * Detects A/B test variants outperforming by >10% in CTR or Conversion
 * and posts Slack alerts with highlights
 */

import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'public/audit-reports/abtest_metrics.csv');
const reportUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/audit-reports/abtest_report.pdf`
  : 'https://dealershipai.com/audit-reports/abtest_report.pdf';

// Check if CSV file exists
if (!fs.existsSync(csvPath)) {
  console.error('⚠️ No audit metrics file found. Skipping Slack alert.');
  console.log(`Expected path: ${csvPath}`);
  process.exit(0);
}

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8').trim();
const lines = csvContent.split('\n');

if (lines.length < 2) {
  console.error('⚠️ CSV file is empty or missing header. Skipping Slack alert.');
  process.exit(0);
}

// Parse CSV data (skip header)
const data = lines.slice(1).map((line) => {
  const [variant, lcp, cls, inp, perf, ctr, conv] = line.split(',');
  return {
    variant: variant?.trim(),
    lcp: parseFloat(lcp),
    cls: parseFloat(cls),
    inp: parseFloat(inp),
    perf: parseFloat(perf),
    ctr: parseFloat(ctr),
    conv: parseFloat(conv),
  };
}).filter(d => d.variant && !isNaN(d.ctr) && !isNaN(d.conv));

if (data.length === 0) {
  console.error('⚠️ No valid data found in CSV. Skipping Slack alert.');
  process.exit(0);
}

// Find leaders
const bestCTR = data.reduce((a, b) => (a.ctr > b.ctr ? a : b));
const bestConv = data.reduce((a, b) => (a.conv > b.conv ? a : b));

// Compute averages
const avgCTR = data.reduce((s, d) => s + d.ctr, 0) / data.length;
const avgConv = data.reduce((s, d) => s + d.conv, 0) / data.length;

// Calculate performance differences
const CTRdiff = avgCTR > 0 ? ((bestCTR.ctr - avgCTR) / avgCTR) * 100 : 0;
const CONVdiff = avgConv > 0 ? ((bestConv.conv - avgConv) / avgConv) * 100 : 0;

// Threshold detection (>10% outperformance)
const threshold = 10;
const CTRexceeds = CTRdiff > threshold;
const CONVexceeds = CONVdiff > threshold;

let alertMsg = null;

if (CTRexceeds || CONVexceeds) {
  // Build alert message with highlights
  const parts = [];
  parts.push('*🚨 A/B Variant Outperformance Detected!*');
  parts.push('');
  
  if (CTRexceeds) {
    parts.push(`> *${bestCTR.variant.toUpperCase()}* leads CTR by ${CTRdiff.toFixed(1)}%`);
    parts.push(`  CTR: ${(bestCTR.ctr * 100).toFixed(2)}% (vs ${(avgCTR * 100).toFixed(2)}% avg)`);
  }
  
  if (CONVexceeds) {
    parts.push(`> *${bestConv.variant.toUpperCase()}* leads Conversion by ${CONVdiff.toFixed(1)}%`);
    parts.push(`  Conversion: ${(bestConv.conv * 100).toFixed(2)}% (vs ${(avgConv * 100).toFixed(2)}% avg)`);
  }
  
  parts.push('');
  parts.push(`Average CTR: ${(avgCTR * 100).toFixed(2)}%`);
  parts.push(`Average Conversion: ${(avgConv * 100).toFixed(2)}%`);
  parts.push('');
  parts.push(`View Report → ${reportUrl}`);
  
  alertMsg = parts.join('\n');
} else {
  // No significant outperformance
  alertMsg = `✅ No variant exceeded ${threshold}% performance threshold.

Average CTR: ${(avgCTR * 100).toFixed(2)}%
Average Conversion: ${(avgConv * 100).toFixed(2)}%

Top Performers:
• CTR: ${bestCTR.variant.toUpperCase()} (${(bestCTR.ctr * 100).toFixed(2)}%)
• Conversion: ${bestConv.variant.toUpperCase()} (${(bestConv.conv * 100).toFixed(2)}%)`;
}

// Send to Slack
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

if (!slackWebhookUrl) {
  console.warn('⚠️ SLACK_WEBHOOK_URL not configured. Skipping Slack notification.');
  console.log('Alert message would be:');
  console.log(alertMsg);
  process.exit(0);
}

try {
  const response = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: alertMsg,
      username: 'DealershipAI Auditor',
      icon_emoji: ':bar_chart:',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: alertMsg,
          },
        },
        ...(CTRexceeds || CONVexceeds ? [
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Report',
                  emoji: true,
                },
                url: reportUrl,
                style: 'primary',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Dashboard',
                  emoji: true,
                },
                url: process.env.NEXT_PUBLIC_APP_URL 
                  ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/audit`
                  : 'https://dealershipai.com/admin/audit',
              },
            ],
          },
        ] : []),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to send Slack alert: ${response.status} ${errorText}`);
    process.exit(1);
  }

  console.log('✅ Slack Performance Alert Sent');
  console.log(`   CTR Leader: ${bestCTR.variant.toUpperCase()} (+${CTRdiff.toFixed(1)}%)`);
  console.log(`   Conversion Leader: ${bestConv.variant.toUpperCase()} (+${CONVdiff.toFixed(1)}%)`);
} catch (error) {
  console.error('❌ Error sending Slack alert:', error);
  process.exit(1);
}

