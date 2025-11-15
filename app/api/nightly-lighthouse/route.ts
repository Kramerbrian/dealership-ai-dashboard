import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Nightly Lighthouse Audit + Trend Logger
 * Runs on a Vercel Cron job: 0 3 * * * (3 AM UTC)
 * Requires: SLACK_WEBHOOK_URL + DEPLOY_URL
 */

export const runtime = 'nodejs'; // Need Node.js for file system access
export const dynamic = 'force-dynamic';

export async function GET() {
  const DEPLOY_URL = process.env.DEPLOY_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://dealershipai.com';
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

  try {
    // --- Run Lighthouse via Google PageSpeed API ---
    const result = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${DEPLOY_URL}&category=performance&category=accessibility&category=best-practices&category=seo`
    ).then((r) => r.json());

    const lhr = (result as any).lighthouseResult?.categories || {};
    const perf = Math.round((lhr.performance?.score || 0) * 100);
    const acc = Math.round((lhr.accessibility?.score || 0) * 100);
    const bp = Math.round((lhr['best-practices']?.score || 0) * 100);
    const seo = Math.round((lhr.seo?.score || 0) * 100);
    const avg = Math.round((perf + acc + bp + seo) / 4);

    // --- Log data to /data/lighthouse-history.json ---
    // Note: In Vercel, we'll use a database or KV store instead of filesystem
    // For now, this works in local/dev environments
    let logData: Array<{
      timestamp: string;
      perf: number;
      acc: number;
      bp: number;
      seo: number;
      avg: number;
      url: string;
    }> = [];

    try {
      const logDir = path.join(process.cwd(), 'data');
      const logFile = path.join(logDir, 'lighthouse-history.json');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      if (fs.existsSync(logFile) && fs.statSync(logFile).size > 0) {
        const content = fs.readFileSync(logFile, 'utf8');
        logData = JSON.parse(content);
      }

      const entry = {
        timestamp: new Date().toISOString(),
        perf,
        acc,
        bp,
        seo,
        avg,
        url: DEPLOY_URL,
      };

      logData.push(entry);
      
      // Keep only last 365 days
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      const filtered = logData.filter(
        (entry) => new Date(entry.timestamp) > oneYearAgo
      );

      fs.writeFileSync(logFile, JSON.stringify(filtered, null, 2));
    } catch (fileError) {
      console.warn('[nightly-lighthouse] File logging failed (expected in Vercel):', fileError);
      // In production, we'd use a database or KV store
    }

    // --- Alert Threshold Check ---
    let alert = '';
    if (perf < 75) alert += '⚠️ Performance below threshold (75%)\n';
    if (acc < 90) alert += '⚠️ Accessibility below threshold (90%)\n';
    if (seo < 80) alert += '⚠️ SEO below threshold (80%)\n';

    // --- Slack Notification ---
    if (SLACK_WEBHOOK_URL) {
      const message = alert
        ? `${alert}\n🌙 *Nightly Lighthouse Audit* — ${new Date().toLocaleDateString()}\n• Performance: ${perf}%\n• Accessibility: ${acc}%\n• Best Practices: ${bp}%\n• SEO: ${seo}%\n• Avg: ${avg}%\n<${DEPLOY_URL}|View Live Site>`
        : `🌙 *Nightly Lighthouse Audit* — ${new Date().toLocaleDateString()}\n• Performance: ${perf}%\n• Accessibility: ${acc}%\n• Best Practices: ${bp}%\n• SEO: ${seo}%\n• Avg: ${avg}%\n<${DEPLOY_URL}|View Live Site>`;

      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      }).catch((err) => {
        console.error('[nightly-lighthouse] Slack notification failed:', err);
      });
    }

    return NextResponse.json({
      status: 'ok',
      perf,
      acc,
      bp,
      seo,
      avg,
      timestamp: new Date().toISOString(),
      logged: logData.length > 0,
    });
  } catch (err: any) {
    console.error('[nightly-lighthouse] error:', err);

    // Log failure to Slack
    if (SLACK_WEBHOOK_URL) {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ *Nightly Lighthouse Audit Failed*\n${err.message}`,
        }),
      }).catch(() => {
        // Ignore Slack errors
      });
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

