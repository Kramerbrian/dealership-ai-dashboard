// ElevenLabs Usage Examples
// This file demonstrates how to use the ElevenLabs integration

import { textToSpeech, getVoices, streamTextToSpeech, createConversationalAgent } from '@/lib/elevenlabs';

// Example 1: Get all available voices
export async function exampleGetVoices() {
  try {
    const voices = await getVoices();
    console.log('Available voices:', voices);
    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

// Example 2: Convert text to speech
export async function exampleTextToSpeech() {
  try {
    // First, get voices to find a voice ID
    const voices = await getVoices();
    const firstVoice = voices.voices?.[0];
    
    if (!firstVoice?.voice_id) {
      throw new Error('No voices available');
    }
    
    // Convert text to speech
    const audio = await textToSpeech(firstVoice.voice_id, 'Hello! This is a test of the ElevenLabs text-to-speech integration.');
    
    return audio;
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
}

// Example 3: Stream text-to-speech (for real-time playback)
export async function exampleStreamTextToSpeech() {
  try {
    const voices = await getVoices();
    const firstVoice = voices.voices?.[0];
    
    if (!firstVoice?.voice_id) {
      throw new Error('No voices available');
    }
    
    // Stream audio
    const audioStream = await streamTextToSpeech(
      firstVoice.voice_id,
      'This is streaming text-to-speech in real-time!'
    );
    
    return audioStream;
  } catch (error) {
    console.error('Error in streaming text-to-speech:', error);
    throw error;
  }
}

// Example 4: Create a conversational AI agent
export async function exampleCreateAgent() {
  try {
    const agent = await createConversationalAgent(
      'DealershipAI Assistant',
      'You are a helpful assistant for automotive dealerships. You help answer questions about inventory, pricing, and services.'
    );
    
    console.log('Created agent:', agent);
    return agent;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
}

// Example 5: Use in a Next.js API route
export async function exampleAPIRoute() {
  // This would be in app/api/example/route.ts
  /*
  import { NextRequest, NextResponse } from 'next/server';
  import { textToSpeech, getVoices } from '@/lib/elevenlabs';

  export async function POST(req: NextRequest) {
    try {
      const { voiceId, text } = await req.json();
      
      if (!voiceId || !text) {
        return NextResponse.json(
          { error: 'voiceId and text are required' },
          { status: 400 }
        );
      }
      
      const audio = await textToSpeech(voiceId, text);
      const audioBuffer = await audio.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      return NextResponse.json({
        audio: base64Audio,
        format: 'audio/mpeg',
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
  */
}

// Example 6: Use in a React Server Component
export async function exampleServerComponent() {
  // This would be in a .tsx file
  /*
  import { getVoices } from '@/lib/elevenlabs';

  export default async function VoiceSelector() {
    const voices = await getVoices();
    
    return (
      <select>
        {voices.voices?.map((voice) => (
          <option key={voice.voice_id} value={voice.voice_id}>
            {voice.name}
          </option>
        ))}
      </select>
    );
  }
  */
}

