/**
 * Generic Node Scheduler (no Vercel/Supabase)
 * Runs nightly MSRP sync and other scheduled jobs
 */

import cron from "node-cron";

const JOB_URL = process.env.JOB_URL || process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/msrp-sync`
  : "http://localhost:3000/api/jobs/msrp-sync";

const TIMEZONE = process.env.TZ || "America/New_York";

/**
 * MSRP Sync Job - Runs nightly at 2 AM
 */
cron.schedule("0 2 * * *", async () => {
  try {
    console.log(`[${new Date().toISOString()}] Starting MSRP sync job...`);
    const response = await fetch(JOB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CRON_SECRET || "local-dev"}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] MSRP sync completed:`, result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MSRP sync error:`, error);
  }
}, {
  timezone: TIMEZONE,
  scheduled: true,
});

/**
 * Weekly Price Changes Report - Runs Sunday at 3 AM
 */
cron.schedule("0 3 * * 0", async () => {
  try {
    console.log(`[${new Date().toISOString()}] Generating weekly price changes report...`);
    const reportUrl = `${JOB_URL.replace('/msrp-sync', '/price-changes')}?since=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`;
    
    const response = await fetch(reportUrl);
    if (response.ok) {
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Weekly report:`, {
        count: data.summary?.count || 0,
        avgDeltaPct: data.summary?.avgDeltaPct || 0,
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Weekly report error:`, error);
  }
}, {
  timezone: TIMEZONE,
  scheduled: true,
});

console.log(`✅ Scheduler started (Timezone: ${TIMEZONE})`);
console.log(`   MSRP Sync: Daily at 2:00 AM`);
console.log(`   Weekly Report: Sunday at 3:00 AM`);
console.log(`   Job URL: ${JOB_URL}`);
console.log(`\nPress Ctrl+C to stop...\n`);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Scheduler stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Scheduler stopped');
  process.exit(0);
});

