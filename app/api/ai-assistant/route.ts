/**
 * AI Assistant API
 *
 * Context-aware AI assistant endpoint with tier-based features
 * Integrates with OpenAI, Anthropic, or Google AI based on availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { subscriptionService } from '@/lib/services/subscription-service';
// import { tables } from '../../../lib/db';

export const runtime = 'nodejs';

interface AIAssistantRequest {
  query: string;
  context: string;
  data: Record<string, any>;
  messages?: Array<{ role: string; content: string; tool_calls?: any[] }>;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  name: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user has access to AI assistant (Pro+ feature)
    // const hasAccess = await subscriptionService.canUserAccessFeature(
    //   userId,
    //   'advanced_analytics'
    // );

    // if (!hasAccess) {
    //   const message = await subscriptionService.getUpgradeMessageForUser(
    //     userId,
    //     'advanced_analytics'
    //   );

    //   return NextResponse.json(
    //     {
    //       error: 'Upgrade required',
    //       message,
    //       upgradeUrl: '/pricing'
    //     },
    //     { status: 403 }
    //   );
    // }

    const body: AIAssistantRequest = await request.json();
    const { query, context, data, messages } = body;

    if (!query || !context) {
      return NextResponse.json(
        { error: 'Query and context are required' },
        { status: 400 }
      );
    }

    // Get user's subscription tier for feature differentiation
    // const tier = await subscriptionService.getUserTier(userId);
    const tier = 'TIER_1'; // Mock tier for now

    // Generate AI response based on context and data
    const response = await generateAIResponse({
      query,
      context,
      data,
      tier,
      userId,
      messages
    });

    // Track AI assistant usage
    // const user = await tables.users().where('clerk_id', userId).first();
    // if (user) {
    //   await tables.auditLog().insert({
    //     user_id: user.id,
    //     tenant_id: user.tenant_id,
    //     action: 'ai_assistant_query',
    //     resource_type: 'ai_assistant',
    //     resource_id: null,
    //     details: JSON.stringify({
    //       context,
    //       query_length: query.length,
    //       tier
    //     })
    //   });
    // }

    // Handle tool calls if present
    if (typeof response === 'object' && 'toolCalls' in response) {
      return NextResponse.json({
        success: true,
        response: response.content,
        toolCalls: response.toolCalls,
        requiresToolExecution: true,
        metadata: {
          context,
          tier,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      response,
      metadata: {
        context,
        tier,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Assistant API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate AI response based on context and available AI providers
 */
async function generateAIResponse({
  query,
  context,
  data,
  tier,
  userId,
  messages
}: {
  query: string;
  context: string;
  data: Record<string, any>;
  tier: string;
  userId: string;
  messages?: any[];
}): Promise<string | { content: string; toolCalls: ToolCall[] }> {
  // Build context-aware prompt
  const systemPrompt = buildSystemPrompt(context, data, tier);
  const userPrompt = query;

  // Try available AI providers in order of preference
  try {
    // Option 1: Anthropic Claude (if available)
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'sk-ant-your-anthropic-key') {
      return await getAnthropicResponse(systemPrompt, userPrompt);
    }

    // Option 2: OpenAI with function calling (if available)
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key') {
      const result = await getOpenAIResponse(systemPrompt, userPrompt, messages);

      // If OpenAI wants to call a tool, return the tool call info
      if (result.toolCalls && result.toolCalls.length > 0) {
        return { content: result.content, toolCalls: result.toolCalls };
      }

      return result.content;
    }

    // Option 3: Google AI (if available)
    if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your-google-ai-key') {
      return await getGoogleAIResponse(systemPrompt, userPrompt);
    }

    // Fallback: Rule-based responses
    return getRuleBasedResponse(query, context, data);

  } catch (error) {
    console.error('AI provider error, falling back to rules:', error);
    return getRuleBasedResponse(query, context, data);
  }
}

/**
 * Build context-aware system prompt
 */
function buildSystemPrompt(context: string, data: Record<string, any>, tier: string): string {
  let prompt = `You are an AI visibility expert assistant for a car dealership dashboard.

Context: ${context}
User Tier: ${tier}

Current Metrics:`;

  if (data.revenueAtRisk) {
    prompt += `\n- Revenue at Risk: $${(data.revenueAtRisk / 1000).toFixed(0)}K`;
  }
  if (data.aiVisibility) {
    prompt += `\n- AI Visibility Score: ${data.aiVisibility}%`;
  }
  if (data.overallScore) {
    prompt += `\n- Overall Score: ${data.overallScore}%`;
  }
  if (data.competitorCount) {
    prompt += `\n- Competitors Tracked: ${data.competitorCount}`;
  }

  prompt += `\n\nProvide concise, actionable insights. Focus on:
- Improving AI visibility and search rankings
- Reducing revenue at risk
- Competitive positioning
- Quick wins and optimizations

Keep responses under 150 words. Be direct and practical.`;

  return prompt;
}

/**
 * Anthropic Claude API
 */
async function getAnthropicResponse(systemPrompt: string, userPrompt: string): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  }) as any;

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response';
}

/**
 * OpenAI API with function calling support
 */
async function getOpenAIResponse(
  systemPrompt: string,
  userPrompt: string,
  messages?: any[]
): Promise<{ content: string; toolCalls?: ToolCall[] }> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Define available tools
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'get_ai_scores',
        description: 'Fetch fresh AI visibility scores and risk analysis for a dealership URL. Use this when the user asks to audit a specific dealership or wants current scores.',
        parameters: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              description: 'The dealership website URL (e.g., https://toyotaofnaples.com)'
            }
          },
          required: ['origin']
        }
      }
    }
  ];

  // Build messages array
  const messagesArray = messages || [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    max_tokens: 300,
    messages: messagesArray as any,
    tools,
    tool_choice: 'auto'
  });

  const choice = response.choices[0];

  // Check if model wants to call a tool
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    return {
      content: choice.message.content || '',
      toolCalls: choice.message.tool_calls.map(tc => ({
        id: tc.id,
        type: 'function',
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments
        }
      }))
    };
  }

  return {
    content: choice.message.content || 'Unable to generate response'
  };
}

/**
 * Google AI API
 */
async function getGoogleAIResponse(systemPrompt: string, userPrompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `${systemPrompt}\n\nUser: ${userPrompt}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}

/**
 * Rule-based fallback responses
 */
function getRuleBasedResponse(query: string, context: string, data: Record<string, any>): string {
  const lowerQuery = query.toLowerCase();

  // Revenue at risk queries
  if (lowerQuery.includes('revenue') || lowerQuery.includes('risk')) {
    const revenue = data.revenueAtRisk || 0;
    if (revenue > 300000) {
      return `Your $${(revenue / 1000).toFixed(0)}K revenue at risk is critically high. Priority actions:\n\n1. Optimize AI visibility (current: ${data.aiVisibility || 'N/A'}%)\n2. Improve zero-click optimization\n3. Fix schema markup gaps\n4. Enhance local SEO presence\n\nThese changes can typically reduce risk by 30-40% within 90 days.`;
    }
    return `Your $${(revenue / 1000).toFixed(0)}K revenue at risk is manageable. Focus on maintaining your AI visibility score and staying ahead of competitors.`;
  }

  // AI visibility queries
  if (lowerQuery.includes('ai visibility') || lowerQuery.includes('visibility score')) {
    const score = data.aiVisibility || 0;
    if (score < 60) {
      return `Your AI visibility score of ${score}% needs improvement. Quick wins:\n\n1. Add FAQ schema markup\n2. Optimize for featured snippets\n3. Improve page load speed\n4. Create AI-friendly content\n\nTarget: 75%+ within 60 days.`;
    }
    return `Your AI visibility score of ${score}% is ${score >= 80 ? 'excellent' : 'good'}. Keep monitoring competitors and maintain content freshness.`;
  }

  // Competitor queries
  if (lowerQuery.includes('competitor') || lowerQuery.includes('competition')) {
    return `Competitive analysis focus areas:\n\n1. Compare AI visibility scores\n2. Analyze their schema markup\n3. Monitor their citation consistency\n4. Track their review velocity\n\n${data.competitorCount ? `You're tracking ${data.competitorCount} competitors.` : 'Add competitors to track their performance.'}`;
  }

  // Quick wins queries
  if (lowerQuery.includes('quick win') || lowerQuery.includes('improve')) {
    return `Top 3 Quick Wins:\n\n1. **Schema Markup** (2-3 days)\n   Add LocalBusiness, FAQPage, Review schemas\n\n2. **Google Business Profile** (1 week)\n   Complete all sections, add photos weekly\n\n3. **Page Speed** (3-5 days)\n   Optimize images, enable caching\n\nExpected impact: 10-15% visibility boost in 30 days.`;
  }

  // General/default response
  return `I can help you with:\n\n📊 Revenue at risk analysis\n🎯 AI visibility optimization\n🏆 Competitor comparisons\n⚡ Quick win strategies\n\nWhat would you like to explore?`;
}

/**
 * Execute a tool call (currently only supports get_ai_scores)
 */
async function executeToolCall(toolCall: ToolCall): Promise<string> {
  const { function: func } = toolCall;

  if (func.name === 'get_ai_scores') {
    try {
      const args = JSON.parse(func.arguments);
      const { origin } = args;

      // Call the internal scores API
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/scores?domain=${encodeURIComponent(origin)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Scores API returned ${response.status}`);
      }

      const data = await response.json();

      // Format the response similar to the test harness
      return JSON.stringify({
        origin,
        visibility: data.aiVisibility || 0,
        overallScore: data.overallScore || 0,
        zeroClickScore: data.zeroClickScore || 0,
        risk_per_month: calculateRiskAmount(data.aiVisibility),
        top_fixes: data.recommendations || [
          'Improve on-page SEO to raise visibility in Google search',
          'Engage with AI platforms to ensure the dealership is mentioned',
          'Encourage happy customers to leave positive reviews on Cars.com and Edmunds'
        ],
        evidence: data.evidence || [
          {
            source: 'ai_visibility_analysis',
            note: 'Comprehensive AI visibility analysis completed'
          }
        ]
      });

    } catch (error) {
      console.error('Tool execution error:', error);
      return JSON.stringify({
        error: 'Failed to fetch AI scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return JSON.stringify({ error: 'Unknown tool', tool: func.name });
}

/**
 * Calculate risk amount based on visibility score
 */
function calculateRiskAmount(visibility: number): number {
  const baseRevenue = 500000; // Average monthly revenue
  const riskFactor = (100 - visibility) / 100;
  return Math.round(baseRevenue * riskFactor);
}
