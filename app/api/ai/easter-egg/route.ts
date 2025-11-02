/**
 * Dynamic Easter Egg API
 * Generates contextual wit using Claude API
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit';

interface EasterEggContext {
  trustScore: number;
  topIssue?: string;
  competitorName?: string;
  dealershipName: string;
  currentTime: string;
  recentAction?: string;
  trigger: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(aiRateLimit, `easter-egg:${clientIP}`);
    
    if (!rateLimitCheck.success && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }

    const context: EasterEggContext = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return static fallback
      const staticEggs: Record<string, string> = {
        'score-42': "42? The answer to life, the universe, and everything... including your Trust Score.",
        'score-88': "88 miles per hour? Great Scott! That's no moon... wait, wrong reference.",
        'score-100': "100/100? That's no moon... it's perfection!",
        '3am': "3am? The witching hour of car sales. Or AI optimization. Either way, you're committed.",
        'competitor': `There is no spoon. Also, no reason ${context.competitorName || 'they'} should be beating you.`,
      };
      
      return NextResponse.json({
        success: true,
        egg: staticEggs[context.trigger] || `Trust Score of ${context.trustScore}? That's no moon...`,
        source: 'static',
      });
    }

    // Generate AI Easter egg via Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `You're an AI Easter egg generator for a car dealership dashboard. Generate a single, witty one-liner (max 15 words) with dry humor and a subtle pop culture reference.

Context:
- Dealership: ${context.dealershipName}
- Trust Score: ${context.trustScore}/100
- Top Issue: ${context.topIssue || 'none'}
- Trigger: ${context.trigger}
- Time: ${context.currentTime}

Style: Ryan Reynolds wit, IYKYK movie references (Nolan, Kubrick, Star Wars, Matrix, sci-fi). Be clever, not forced.

Examples:
- Score 88: "Great Scott! 88 means the flux capacitor is... wait, wrong dashboard."
- Low score at night: "The night is darkest before the dawn. Or before you fix your schema."
- Competitor ahead: "There is no spoon. Also, no reason ${context.competitorName || 'they'} should be beating you."

Generate ONE witty line for this trigger. NO quotes, NO explanation, JUST the line:`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const eggText = data.content?.[0]?.text?.trim().replace(/^["']|["']$/g, '') || 
                   `Trust Score of ${context.trustScore}? That's no moon...`;
    
    return NextResponse.json({
      success: true,
      egg: eggText,
      source: 'ai-generated',
    });

  } catch (error) {
    console.error('[Easter Egg] Error:', error);
    
    // Return static fallback (can't re-read body, use default)
    return NextResponse.json({
      success: true,
      egg: `Trust Score? That's no moon...`,
      source: 'error-fallback',
    });
  }
}

