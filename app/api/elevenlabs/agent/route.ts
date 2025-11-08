import { NextRequest, NextResponse } from 'next/server';
import { createConversationalAgent } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  try {
    const { name, prompt } = await req.json();

    if (!name || !prompt) {
      return NextResponse.json(
        { success: false, error: 'name and prompt are required' },
        { status: 400 }
      );
    }

    const agent = await createConversationalAgent(name, prompt);
    
    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    console.error('ElevenLabs agent creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}

