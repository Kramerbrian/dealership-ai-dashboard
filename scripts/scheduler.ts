/**
 * Generic Node scheduler for MSRP sync (no Vercel/Supabase)
 * 
 * Runs nightly at 2 AM EST to trigger MSRP sync job
 * Usage: npm run start:scheduler
 */

import cron from "node-cron";

const JOB_URL = process.env.JOB_URL ?? "http://localhost:3000/api/jobs/msrp-sync";

cron.schedule("0 2 * * *", async () => {
  try {
    console.log(`[msrp-sync] Starting scheduled job at ${new Date().toISOString()}`);
    const r = await fetch(JOB_URL);
    const result = await r.json();
    console.log("[msrp-sync] Job completed:", result);
  } catch (e) {
    console.error("[msrp-sync] Error:", e);
    process.exit(1);
  }
}, { 
  timezone: "America/New_York",
  scheduled: true
});

console.log("[scheduler] MSRP sync scheduler started. Running nightly at 2 AM EST.");
console.log(`[scheduler] Job URL: ${JOB_URL}`);

// Keep process alive
process.on("SIGINT", () => {
  console.log("[scheduler] Shutting down...");
  process.exit(0);
});

