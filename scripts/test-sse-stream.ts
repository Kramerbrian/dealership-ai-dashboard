/**
 * Test SSE (Server-Sent Events) Stream
 * 
 * Tests the real-time event streaming endpoint
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testSSEStream() {
  console.log('🧪 Testing SSE Stream...\n');

  return new Promise((resolve, reject) => {
    const eventSource = new (require('eventsource'))(`${baseUrl}/api/realtime/events?dealerId=test`);

    let eventsReceived = 0;
    const maxEvents = 5; // Wait for 5 events or 30 seconds
    const timeout = setTimeout(() => {
      eventSource.close();
      if (eventsReceived > 0) {
        console.log(`✅ SSE Stream working! Received ${eventsReceived} events`);
        resolve({ success: true, eventsReceived });
      } else {
        console.log('⚠️  SSE Stream connected but no events received');
        resolve({ success: false, eventsReceived: 0, warning: 'No events received' });
      }
    }, 30000);

    eventSource.onopen = () => {
      console.log('✅ SSE Stream connected successfully');
    };

    eventSource.onmessage = (event: any) => {
      eventsReceived++;
      try {
        const data = JSON.parse(event.data);
        console.log(`📨 Event received (${eventsReceived}):`, data.type);
        
        if (eventsReceived >= maxEvents) {
          clearTimeout(timeout);
          eventSource.close();
          console.log(`✅ SSE Stream test complete! Received ${eventsReceived} events`);
          resolve({ success: true, eventsReceived });
        }
      } catch (error) {
        console.error('Error parsing event:', error);
      }
    };

    eventSource.onerror = (error: any) => {
      console.error('❌ SSE Stream error:', error);
      clearTimeout(timeout);
      eventSource.close();
      reject(error);
    };
  });
}

// Note: This requires 'eventsource' package for Node.js
// npm install eventsource
if (require.main === module) {
  try {
    testSSEStream()
      .then((result) => {
        console.log('\n📊 Test Result:', result);
        process.exit((result as any).success ? 0 : 1);
      })
      .catch((error) => {
        console.error('Test failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('SSE test requires eventsource package. Install with: npm install eventsource');
    console.error('Or test manually in browser:');
    console.error(`  const es = new EventSource('${baseUrl}/api/realtime/events?dealerId=test');`);
    console.error('  es.onmessage = (e) => console.log(JSON.parse(e.data));');
    process.exit(1);
  }
}

export { testSSEStream };

