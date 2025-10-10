#!/usr/bin/env node

/**
 * AOER Worker Runner Script
 * Runs the AOER orchestrator worker for testing
 */

const { aoerOrchestrator, enqueueTenantRecompute } = require('../workers/aoerOrchestrator.worker');

async function runWorker() {
  console.log('🚀 Starting AOER Orchestrator Worker...\n');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await aoerOrchestrator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await aoerOrchestrator.stop();
    process.exit(0);
  });

  try {
    // Start the worker
    await aoerOrchestrator.start();
    
    // Test enqueue function
    const testTenantId = process.argv[2] || 'e1a63d30-4a8b-4bb9-86e8-48c7238a54de';
    console.log(`\n🧪 Testing enqueue function with tenant: ${testTenantId}`);
    
    const success = await enqueueTenantRecompute(testTenantId, 'high');
    if (success) {
      console.log('✅ Successfully queued tenant for recomputation');
    } else {
      console.log('❌ Failed to queue tenant for recomputation');
    }

    // Keep the worker running
    console.log('\n⏳ Worker is running... Press Ctrl+C to stop');
    
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

// Run the worker
if (require.main === module) {
  runWorker().catch(console.error);
}

module.exports = { runWorker };
