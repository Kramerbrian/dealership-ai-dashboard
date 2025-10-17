#!/usr/bin/env tsx
// Start ADA Jobs
// DealershipAI - Initialize ADA Job Processing System

// Load mock environment for testing
import "../scripts/mock-ada-environment";

import { adaReanalysisQueue } from "../jobs/adaReanalysisProcessor";
import { initializeADASchedules } from "../jobs/adaScheduler";
import { startMonitoring } from "../jobs/adaMonitor";

async function startADAJobs() {
  console.log("🚀 Starting DealershipAI ADA Job System...");
  
  try {
    // Initialize schedules
    await initializeADASchedules();
    
    // Start monitoring
    await startMonitoring();
    
    // Test queue connection
    const queueStats = await adaReanalysisQueue.getJobCounts();
    console.log("📊 Queue Status:", queueStats);
    
    console.log("✅ ADA Job System started successfully");
    console.log("📅 Schedules initialized");
    console.log("🔍 Monitoring active");
    console.log("⏰ Jobs will run according to schedule");
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log("\n🛑 Shutting down ADA Job System...");
      await adaReanalysisQueue.close();
      process.exit(0);
    });
    
    // Keep alive
    setInterval(() => {
      // Heartbeat
    }, 60000);
    
  } catch (error) {
    console.error("❌ Failed to start ADA Job System:", error);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startADAJobs();
}

export default startADAJobs;
