/**
 * Test script for AI Assistant tool calling
 *
 * This simulates the conversation flow from the test harness:
 * 1. User asks to audit a URL
 * 2. AI calls get_ai_scores tool
 * 3. Tool executes and returns results
 * 4. AI summarizes findings
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

async function testToolCalling() {
  console.log('🧪 Testing AI Assistant Tool Calling\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: Simple query (should not trigger tool)
  console.log('Test 1: Simple metrics query');
  console.log('Query: "What is my current revenue at risk?"\n');

  try {
    const res1 = await fetch(`${BASE_URL}/api/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'What is my current revenue at risk?',
        context: 'dealership-overview',
        data: {
          revenueAtRisk: 325000,
          aiVisibility: 45,
          overallScore: 62
        }
      })
    });

    if (res1.ok) {
      const data1 = await res1.json();
      console.log('✅ Response:', data1.response);
      console.log('Tool calls:', data1.toolCalls ? 'Yes' : 'No');
    } else {
      console.log('❌ Failed:', res1.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 2: Audit request (should trigger tool)
  console.log('Test 2: Audit request (tool calling)');
  console.log('Query: "Audit https://toyotaofnaples.com and give me risk $, fixes, and proof"\n');

  try {
    // Step 1: Initial request
    const res2 = await fetch(`${BASE_URL}/api/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'Audit https://toyotaofnaples.com and give me risk $, fixes, and proof',
        context: 'dealership-overview',
        data: {
          revenueAtRisk: 325000,
          aiVisibility: 45
        },
        messages: [
          {
            role: 'user',
            content: 'Audit https://toyotaofnaples.com and give me risk $, fixes, and proof'
          }
        ]
      })
    });

    if (!res2.ok) {
      console.log('❌ Initial request failed:', res2.status);
      return;
    }

    const data2 = await res2.json();
    console.log('Initial response:', data2.response || '(empty)');
    console.log('Requires tool execution:', data2.requiresToolExecution ? 'Yes' : 'No');

    if (data2.requiresToolExecution && data2.toolCalls) {
      console.log('Tool calls:', data2.toolCalls.length);

      // Step 2: Execute the tool
      const toolCall = data2.toolCalls[0];
      console.log('\n🔧 Executing tool:', toolCall.function.name);
      console.log('Arguments:', toolCall.function.arguments);

      const toolRes = await fetch(`${BASE_URL}/api/ai-assistant/execute-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ toolCall })
      });

      if (!toolRes.ok) {
        console.log('❌ Tool execution failed:', toolRes.status);
        return;
      }

      const toolData = await toolRes.json();
      console.log('✅ Tool result received');

      const result = JSON.parse(toolData.result);
      console.log('\n📊 Scores:');
      console.log('  - AI Visibility:', result.aiVisibility + '%');
      console.log('  - Risk per month: $' + result.risk_per_month.toLocaleString());
      console.log('  - Top fixes:', result.top_fixes.length);

      // Step 3: Get final summary from AI
      console.log('\n🤖 Getting AI summary...');

      const messages = [
        {
          role: 'user',
          content: 'Audit https://toyotaofnaples.com and give me risk $, fixes, and proof'
        },
        {
          role: 'assistant',
          content: '',
          tool_calls: [toolCall]
        },
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolData.result
        }
      ];

      const finalRes = await fetch(`${BASE_URL}/api/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          query: 'Summarize the audit results with risk, fixes, and proof',
          context: 'dealership-overview',
          data: {},
          messages
        })
      });

      if (finalRes.ok) {
        const finalData = await finalRes.json();
        console.log('\n✅ Final summary:');
        console.log(finalData.response);
      } else {
        console.log('❌ Failed to get final summary:', finalRes.status);
      }
    } else {
      console.log('✅ Direct response (no tool calling):');
      console.log(data2.response);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏁 Test complete!\n');
}

// Run the test
testToolCalling().catch(console.error);
