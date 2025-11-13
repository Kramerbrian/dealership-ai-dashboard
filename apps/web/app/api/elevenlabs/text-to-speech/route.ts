import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voiceId, text, modelId, stability, similarityBoost } = body;

    if (!voiceId || !text) {
      return NextResponse.json(
        { error: 'voiceId and text are required' },
        { status: 400 }
      );
    }

    const audio = await textToSpeech(voiceId, text, {
      modelId: modelId || "eleven_multilingual_v2",
      stability,
      similarityBoost,
    });

    // Convert audio to base64 for response
    const audioBuffer = await audio.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: base64Audio,
      format: 'audio/mpeg',
    });
  } catch (error: any) {
    console.error('[elevenlabs] Error in text-to-speech:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
