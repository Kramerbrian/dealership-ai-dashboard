/**
 * Test Redis Pub/Sub Events
 * 
 * Tests Redis Pub/Sub functionality and event bus
 */

async function testRedisPubSub() {
  console.log('🧪 Testing Redis Pub/Sub...\n');

  try {
    // Import event bus
    const { publish, Channels } = await import('../lib/events/bus');

    // Test publishing events
    console.log('📤 Publishing test events...');

    // Test AI Score Update event
    await publish(Channels.ai, {
      vin: 'TEST123456789',
      dealerId: 'test-dealer',
      reason: 'test_event',
      avi: 0.87,
      ati: 0.92,
      cis: 0.85,
      ts: new Date().toISOString(),
    });
    console.log('✅ Published AI score update event');

    // Test MSRP Change event
    await publish(Channels.msrp, {
      vin: 'TEST123456789',
      old: 25000,
      new: 24900,
      deltaPct: -0.4,
      ts: new Date().toISOString(),
    });
    console.log('✅ Published MSRP change event');

    // Check Redis status
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      console.log('✅ Redis URL configured');
      console.log(`   Using: ${redisUrl.replace(/:[^:@]+@/, ':****@')}`);
    } else {
      console.log('⚠️  Redis URL not configured - using local EventEmitter fallback');
    }

    // Check diagnostics endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${baseUrl}/api/diagnostics/redis`);
      if (response.ok) {
        const data = await response.json();
        console.log('\n📊 Redis Diagnostics:');
        console.log(`   Status: ${data.status}`);
        console.log(`   Mode: ${data.mode || 'unknown'}`);
      }
    } catch (error) {
      console.log('⚠️  Could not check diagnostics endpoint');
    }

    console.log('\n✅ Redis Pub/Sub test complete!');
    return { success: true };
  } catch (error) {
    console.error('❌ Redis Pub/Sub test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run if executed directly
if (require.main === module) {
  testRedisPubSub()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testRedisPubSub };

