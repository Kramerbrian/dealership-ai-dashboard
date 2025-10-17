#!/usr/bin/env tsx
// Mock ADA Jobs
// DealershipAI - Mock ADA Job System for Testing

// Load mock environment
import "./mock-ada-environment";

console.log("🚀 Starting Mock DealershipAI ADA Job System...");

// Mock queue stats
let mockQueueStats = {
  waiting: 0,
  active: 0,
  completed: 0,
  failed: 0,
  stalled: 0
};

// Mock schedules
const mockSchedules = [
  {
    name: "nightly-bulk-reanalysis",
    cron: "0 1 * * *",
    enabled: true,
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    status: "completed"
  },
  {
    name: "priority-reanalysis",
    cron: "0 */6 * * *",
    enabled: true,
    nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: "completed"
  }
];

// Mock monitoring data
const mockMonitoringData = {
  queueHealth: mockQueueStats,
  performance: {
    avgProcessingTime: 45000, // 45 seconds
    throughput: 12.5, // jobs per hour
    errorRate: 0.02 // 2%
  },
  schedules: {
    active: 2,
    total: 2,
    nextRun: mockSchedules[0].nextRun
  },
  alerts: [
    {
      type: "info",
      message: "System running normally",
      timestamp: new Date(),
      metadata: {}
    }
  ]
};

// Mock job processing
function mockProcessJob(jobData: any) {
  console.log(`🔍 Mock processing ADA job:`, jobData);
  
  // Simulate processing time
  const processingTime = Math.random() * 30000 + 10000; // 10-40 seconds
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        tenantId: jobData.tenantId,
        vertical: jobData.vertical,
        summaryScore: Math.random() * 100,
        performanceDetractors: ["Mock detractor 1", "Mock detractor 2"],
        penalties: [
          { metric: "seo", penalty: 0.1, reason: "Mock penalty" }
        ],
        enhancers: [
          { action: "Mock enhancement", impact: 0.2, effort: "low" }
        ],
        processingTime,
        dataPoints: Math.floor(Math.random() * 100) + 50
      };
      
      mockQueueStats.completed++;
      mockQueueStats.active--;
      
      console.log(`✅ Mock job completed:`, result);
      resolve(result);
    }, processingTime);
  });
}

// Mock API endpoints
function mockAPIEndpoints() {
  console.log("🌐 Mock API endpoints available:");
  console.log("  POST /api/ada/trigger - Trigger manual analysis");
  console.log("  GET  /api/ada/trigger?jobId=123 - Check job status");
  console.log("  GET  /api/ada/monitor - View monitoring dashboard");
  console.log("  GET  /api/ada/schedule - View schedule status");
  console.log("  POST /api/ada/schedule - Manage schedules");
  console.log("");
  console.log("📋 Example API calls:");
  console.log("");
  console.log("// Trigger manual analysis");
  console.log("curl -X POST http://localhost:3000/api/ada/trigger \\");
  console.log("  -H 'Content-Type: application/json' \\");
  console.log("  -H 'x-role: admin' \\");
  console.log("  -d '{\"tenantId\":\"123e4567-e89b-12d3-a456-426614174000\",\"vertical\":\"sales\",\"priority\":\"high\",\"forceRefresh\":true}'");
  console.log("");
  console.log("// Check job status");
  console.log("curl http://localhost:3000/api/ada/trigger?jobId=123 \\");
  console.log("  -H 'x-role: admin'");
  console.log("");
  console.log("// View monitoring dashboard");
  console.log("curl http://localhost:3000/api/ada/monitor \\");
  console.log("  -H 'x-role: admin'");
  console.log("");
  console.log("// View schedule status");
  console.log("curl http://localhost:3000/api/ada/schedule \\");
  console.log("  -H 'x-role: admin'");
  console.log("");
  console.log("// Trigger schedule");
  console.log("curl -X POST http://localhost:3000/api/ada/schedule \\");
  console.log("  -H 'Content-Type: application/json' \\");
  console.log("  -H 'x-role: admin' \\");
  console.log("  -d '{\"action\":\"trigger\",\"scheduleName\":\"nightly-bulk-reanalysis\"}'");
}

// Simulate job processing
function simulateJobProcessing() {
  console.log("⚙️ Simulating job processing...");
  
  // Simulate some jobs
  const mockJobs = [
    { tenantId: "tenant-1", vertical: "sales", priority: "high" },
    { tenantId: "tenant-2", vertical: "service", priority: "normal" },
    { tenantId: "tenant-3", vertical: "parts", priority: "low" }
  ];
  
  mockJobs.forEach((job, index) => {
    setTimeout(() => {
      mockQueueStats.waiting++;
      mockProcessJob(job);
    }, index * 5000); // Start jobs 5 seconds apart
  });
}

// Main function
async function startMockADAJobs() {
  console.log("✅ Mock ADA Job System started successfully");
  console.log("📊 Initial Queue Stats:", mockQueueStats);
  console.log("📅 Active Schedules:", mockSchedules.length);
  console.log("");
  
  mockAPIEndpoints();
  
  // Start job simulation
  simulateJobProcessing();
  
  // Update stats every 30 seconds
  setInterval(() => {
    console.log("📊 Current Queue Stats:", mockQueueStats);
  }, 30000);
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log("\n🛑 Shutting down Mock ADA Job System...");
    process.exit(0);
  });
  
  // Keep alive
  setInterval(() => {
    // Heartbeat
  }, 60000);
}

// Start if run directly
if (require.main === module) {
  startMockADAJobs().catch(console.error);
}

export default startMockADAJobs;
