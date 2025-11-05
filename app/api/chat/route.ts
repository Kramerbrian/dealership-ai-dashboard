import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock database functions (replace with actual implementations)
async function checkChatLimit(userId: string, tier: string): Promise<{ allowed: boolean; count: number; limit: number }> {
  // TODO: Implement actual database query
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  
  // Mock: return demo data
  return {
    allowed: tier !== 'free' || 2 < 5,
    count: 2,
    limit: tier === 'free' ? 5 : 999
  };
}

async function getUserContext(userId: string) {
  // TODO: Implement actual database query
  return {
    dealership: {
      name: 'Demo Dealership',
      aiv_score: 87.3,
      market_rank: 3,
      competitors: [{ name: 'Competitor A' }]
    }
  };
}

async function saveChatMessage(userId: string, message: string, response: string) {
  // TODO: Implement actual database save
  console.log('Chat message saved:', { userId, message, response });
}

function extractActions(response: string, tier: string) {
  const actions = [];
  
  if (response.includes('schema markup') && tier === 'acceleration') {
    actions.push({
      label: 'Deploy Schema Strategy',
      strategy_id: 'strategy-schema'
    });
  }
  
  return actions;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, tier = 'free' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check rate limit for free tier
    const limitCheck = await checkChatLimit(userId, tier);
    
    if (!limitCheck.allowed) {
      return NextResponse.json({
        response: "You've used all 5 free questions today. Upgrade to Pro for unlimited questions!",
        upgrade_prompt: true,
        usage: limitCheck
      });
    }

    // Get user context
    const userContext = await getUserContext(userId);

    // Call OpenAI with context
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      // Return demo response if OpenAI not configured
      const demoResponse = `I can help you understand your dealership's AI visibility metrics. 

Your current AIV score is ${userContext.dealership.aiv_score}%, which puts you at rank #${userContext.dealership.market_rank} among competitors.

To improve your score, I'd recommend:
1. Implementing schema markup (can add +18 AIV points)
2. Improving review response rates (can add +12 AIV points)
3. Publishing fresh content (can add +8 AIV points)

${tier === 'free' ? 'Upgrade to Pro for detailed playbooks and implementation guides.' : 'Would you like me to generate a detailed action plan?'}`;

      return NextResponse.json({
        response: demoResponse,
        actions: extractActions(demoResponse, tier),
        usage: limitCheck
      });
    }

    try {
      const completion = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are dAI, the AI assistant for DealershipAI. You help dealerships understand their metrics and competitive position.
              
Current dealership context:
- Name: ${userContext.dealership.name}
- AIV Score: ${userContext.dealership.aiv_score || 'calculating...'}
- Market Rank: #${userContext.dealership.market_rank || '?'}
- Top Competitor: ${userContext.dealership.competitors[0]?.name || 'none'}
- User Tier: ${tier}

Communication style: Confident coach helping them win. Use phrases like "Here's what it looks like they're doing" and "Curious how they did it?" when discussing competitors.

${tier === 'free' ? 'For detailed playbooks, suggest upgrading to Pro.' : ''}
${tier === 'acceleration' ? 'You can offer to deploy strategies directly.' : ''}`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!completion.ok) {
        throw new Error(`OpenAI API error: ${completion.status}`);
      }

      const data = await completion.json();
      const response = data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';

      // Save message
      await saveChatMessage(userId, message, response);

      // Check if response suggests a strategy
      const actions = extractActions(response, tier);

      return NextResponse.json({
        response,
        actions,
        usage: limitCheck
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Fallback response
      const fallbackResponse = `I'm having trouble connecting to the AI service right now. 

Based on your current metrics:
- AIV Score: ${userContext.dealership.aiv_score}%
- Market Rank: #${userContext.dealership.market_rank}

Common ways to improve include implementing schema markup, improving review responses, and publishing fresh content.

Please try again in a moment, or contact support if the issue persists.`;

      return NextResponse.json({
        response: fallbackResponse,
        actions: [],
        usage: limitCheck,
        error: 'AI service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
