/**
 * Slack Anomaly Summary Script
 * 
 * Provides weekly digest of A/B test performance anomalies
 * Runs after audit reports to track trends over time
 */

import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'public/audit-reports/abtest_metrics.csv');
const reportUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/audit-reports/abtest_report.pdf`
  : 'https://dealershipai.com/audit-reports/abtest_report.pdf';

// Check if CSV file exists
if (!fs.existsSync(csvPath)) {
  console.log('⚠️ No audit metrics file found. Skipping anomaly summary.');
  process.exit(0);
}

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8').trim();
const lines = csvContent.split('\n');

if (lines.length < 2) {
  console.log('⚠️ CSV file is empty. Skipping anomaly summary.');
  process.exit(0);
}

// Parse CSV data
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
  console.log('⚠️ No valid data found. Skipping anomaly summary.');
  process.exit(0);
}

// Calculate averages
const avgCTR = data.reduce((s, d) => s + d.ctr, 0) / data.length;
const avgConv = data.reduce((s, d) => s + d.conv, 0) / data.length;
const avgPerf = data.reduce((s, d) => s + d.perf, 0) / data.length;
const avgLCP = data.reduce((s, d) => s + d.lcp, 0) / data.length;

// Find performance anomalies
const anomalies = [];

// Check for CTR anomalies (>7.5% variance)
data.forEach((d) => {
  const ctrDiff = ((d.ctr - avgCTR) / avgCTR) * 100;
  if (Math.abs(ctrDiff) > 7.5) {
    anomalies.push({
      type: 'CTR',
      variant: d.variant,
      diff: ctrDiff,
      value: d.ctr,
      avg: avgCTR,
    });
  }
});

// Check for Conversion anomalies (>5% variance with sufficient sample)
data.forEach((d) => {
  const convDiff = ((d.conv - avgConv) / avgConv) * 100;
  if (Math.abs(convDiff) > 5) {
    anomalies.push({
      type: 'Conversion',
      variant: d.variant,
      diff: convDiff,
      value: d.conv,
      avg: avgConv,
    });
  }
});

// Check for Performance score anomalies (LCP degradation >0.5s)
data.forEach((d) => {
  if (d.lcp > avgLCP + 0.5) {
    anomalies.push({
      type: 'Performance',
      variant: d.variant,
      issue: `LCP degradation: ${d.lcp.toFixed(2)}s (vs ${avgLCP.toFixed(2)}s avg)`,
      severity: d.lcp > 4.0 ? 'critical' : 'warning',
    });
  }
});

// Build summary message
const parts = [];
parts.push('*📊 A/B Test Anomaly Summary*');
parts.push('');

if (anomalies.length === 0) {
  parts.push('✅ No significant anomalies detected.');
  parts.push('');
  parts.push('*Summary:*');
  parts.push(`• Average CTR: ${(avgCTR * 100).toFixed(2)}%`);
  parts.push(`• Average Conversion: ${(avgConv * 100).toFixed(2)}%`);
  parts.push(`• Average Performance Score: ${avgPerf.toFixed(0)}`);
} else {
  parts.push(`⚠️ Detected ${anomalies.length} anomaly${anomalies.length > 1 ? 'ies' : ''}:`);
  parts.push('');
  
  anomalies.forEach((anomaly, idx) => {
    if (anomaly.type === 'CTR' || anomaly.type === 'Conversion') {
      const emoji = anomaly.diff > 0 ? '⬆️' : '⬇️';
      parts.push(`${idx + 1}. ${emoji} *${anomaly.variant.toUpperCase()}* - ${anomaly.type}`);
      parts.push(`   ${anomaly.diff > 0 ? '+' : ''}${anomaly.diff.toFixed(1)}% (${(anomaly.value * 100).toFixed(2)}% vs ${(anomaly.avg * 100).toFixed(2)}% avg)`);
    } else if (anomaly.type === 'Performance') {
      const emoji = anomaly.severity === 'critical' ? '🔴' : '🟡';
      parts.push(`${idx + 1}. ${emoji} *${anomaly.variant.toUpperCase()}* - ${anomaly.issue}`);
    }
    parts.push('');
  });
  
  parts.push('*Summary:*');
  parts.push(`• Average CTR: ${(avgCTR * 100).toFixed(2)}%`);
  parts.push(`• Average Conversion: ${(avgConv * 100).toFixed(2)}%`);
  parts.push(`• Average Performance Score: ${avgPerf.toFixed(0)}`);
}

parts.push('');
parts.push(`View Full Report → ${reportUrl}`);

const summaryMsg = parts.join('\n');

// Send to Slack (only if webhook is configured)
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

if (!slackWebhookUrl) {
  console.log('⚠️ SLACK_WEBHOOK_URL not configured. Skipping Slack notification.');
  console.log('Summary would be:');
  console.log(summaryMsg);
  process.exit(0);
}

try {
  const response = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: summaryMsg,
      username: 'DealershipAI Auditor',
      icon_emoji: ':chart_with_upwards_trend:',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: summaryMsg,
          },
        },
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
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to send Slack summary: ${response.status} ${errorText}`);
    process.exit(1);
  }

  console.log('✅ Slack Anomaly Summary Sent');
  console.log(`   Anomalies detected: ${anomalies.length}`);
} catch (error) {
  console.error('❌ Error sending Slack summary:', error);
  process.exit(1);
}

