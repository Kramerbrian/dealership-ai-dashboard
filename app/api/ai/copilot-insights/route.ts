/**
 * AI Copilot Insights API
 * Generates proactive recommendations using Claude API
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit';

interface DashboardState {
  trustScore: number;
  scoreDelta: number;
  pillars: {
    seo: number;
    aeo: number;
    geo: number;
    qai: number;
  };
  criticalIssues: number;
  recentActivity: string[];
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(aiRateLimit, `copilot:${clientIP}`);
    
    if (!rateLimitCheck.success && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }

    const dashboardState: DashboardState = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return rule-based fallback
      return NextResponse.json({
        success: true,
        insights: [
          {
            priority: 'high',
            title: `${dashboardState.criticalIssues} critical issues need attention`,
            description: `Fixing these could boost your score by ${Math.round(dashboardState.trustScore * 0.1)}-${Math.round(dashboardState.trustScore * 0.15)} points`,
            action: 'Review recommendations',
          },
        ],
        source: 'rule-based',
      });
    }

    // Generate AI insights using Claude
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You're an AI copilot for a car dealership dashboard. Generate 2-3 proactive, actionable insights based on this data:

Trust Score: ${dashboardState.trustScore}/100 (${dashboardState.scoreDelta > 0 ? '+' : ''}${dashboardState.scoreDelta} this week)
Pillars: SEO ${dashboardState.pillars.seo}, AEO ${dashboardState.pillars.aeo}, GEO ${dashboardState.pillars.geo}, QAI ${dashboardState.pillars.qai}
Critical Issues: ${dashboardState.criticalIssues}
Recent Activity: ${dashboardState.recentActivity.join(', ')}

Return ONLY a JSON array with this exact format:
[
  {
    "priority": "high|medium|low",
    "title": "Short actionable title (max 10 words)",
    "description": "Specific recommendation (max 20 words)",
    "action": "Button text"
  }
]

Be specific, actionable, and prioritize quick wins. Focus on the lowest pillar score and critical issues.`
        }]
      })
    });

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
    }

    const data = await anthropicResponse.json();
    const content = data.content?.[0]?.text || '';
    
    // Parse JSON from response
    let insights;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      insights = JSON.parse(jsonMatch[1] || jsonMatch[0] || '[]');
    } catch {
      // Fallback to rule-based
      insights = [{
        priority: 'high',
        title: `${dashboardState.criticalIssues} critical issues need attention`,
        description: `Fixing these could boost your score by ${Math.round(dashboardState.trustScore * 0.1)}-${Math.round(dashboardState.trustScore * 0.15)} points`,
        action: 'Review recommendations',
      }];
    }

    const apiResponse = NextResponse.json({
      success: true,
      insights,
      source: 'ai-generated',
    });

    // Add rate limit headers
    if (rateLimitCheck.limit && rateLimitCheck.remaining !== undefined) {
      apiResponse.headers.set('X-RateLimit-Limit', String(rateLimitCheck.limit));
      apiResponse.headers.set('X-RateLimit-Remaining', String(rateLimitCheck.remaining));
      if (rateLimitCheck.reset) {
        apiResponse.headers.set('X-RateLimit-Reset', String(rateLimitCheck.reset));
      }
    }

    return apiResponse;

  } catch (error) {
    console.error('[AI Copilot] Error:', error);
    
    // Return rule-based fallback (with default state since we can't re-read the body)
    return NextResponse.json({
      success: true,
      insights: [{
        priority: 'high',
        title: 'AI insights temporarily unavailable',
        description: 'Using rule-based recommendations. Check your API key configuration.',
        action: 'Review recommendations',
      }],
      source: 'rule-based-fallback',
    });
  }
}

