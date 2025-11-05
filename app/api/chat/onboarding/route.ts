import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Chat-based onboarding agent
 * 
 * Extracts dealership information from natural conversation:
 * - Name
 * - City, State
 * - Website (optional)
 * - Coordinates (if location provided)
 * 
 * Returns structured data when all required fields are collected.
 */

interface OnboardingState {
  name?: string;
  city?: string;
  state?: string;
  website?: string;
  lat?: number;
  lng?: number;
  collected: string[];
}

const SYSTEM_PROMPT = `You are a friendly AI onboarding assistant for DealershipAI. Your goal is to collect the following information through natural conversation:

1. Dealership name (required)
2. City (required)
3. State (required)
4. Website URL (optional)
5. Location coordinates (optional, can be derived from city/state)

Be conversational, friendly, and ask one question at a time. Once you have name, city, and state, acknowledge the completion and ask if they'd like to add their website or connect Google Business Profile.

When all required fields (name, city, state) are collected, respond with a JSON object in this exact format:
\`\`\`json
{
  "complete": true,
  "data": {
    "name": "Dealership Name",
    "city": "City",
    "state": "State",
    "website": "https://example.com" (optional),
    "lat": 0.0 (optional),
    "lng": 0.0 (optional)
  }
}
\`\`\`

Otherwise, continue the conversation naturally.`;

export async function POST(req: Request) {
  try {
    const { messages, state } = await req.json();

    // Initialize conversation if needed
    if (!messages || messages.length === 0) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'assistant', content: "Hi! I'm your AI onboarding assistant. I'll help you set up your dealership profile. Let's start with your dealership name - what should I call it?" },
        ],
        temperature: 0.7,
      });

      return NextResponse.json({
        message: completion.choices[0].message.content,
        state: { collected: [] },
      });
    }

    // Continue conversation
    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || '';

    // Check if response contains completion JSON
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.complete && parsed.data) {
          return NextResponse.json({
            message: response,
            complete: true,
            data: parsed.data,
          });
        }
      } catch (e) {
        // Continue normal flow if JSON parsing fails
      }
    }

    return NextResponse.json({
      message: response,
      state: state || { collected: [] },
    });
  } catch (error) {
    console.error('[Onboarding Chat] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

