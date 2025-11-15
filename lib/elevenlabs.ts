// @ts-ignore
// ElevenLabs - optional, fallback if not installed
let ElevenLabsClient: any = null;
try {
  ElevenLabsClient = require("@elevenlabs/elevenlabs-js").ElevenLabsClient;
} catch {
  // ElevenLabs is optional
}

// Initialize ElevenLabs client
// API key defaults to process.env.ELEVENLABS_API_KEY
let _client: typeof ElevenLabsClient | null = null;

export function getElevenLabsClient(): typeof ElevenLabsClient {
  if (!ElevenLabsClient) {
    throw new Error('ElevenLabs SDK not installed. Install @elevenlabs/elevenlabs-js to use this feature.');
  }
  
  if (_client) return _client;
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.warn('[elevenlabs] ELEVENLABS_API_KEY not set - ElevenLabs features disabled');
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }
  
  _client = new ElevenLabsClient({
    apiKey: apiKey,
  });
  
  return _client;
}

// Helper function to get available voices
export async function getVoices() {
  const client = getElevenLabsClient();
  return await client.voices.search();
}

// Helper function for text-to-speech
export async function textToSpeech(voiceId: string, text: string, options?: {
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}) {
  const client = getElevenLabsClient();
  
  return await client.textToSpeech.convert(voiceId, {
    text,
    modelId: options?.modelId || "eleven_multilingual_v2",
    ...options,
  });
}

// Helper function for streaming text-to-speech
export async function streamTextToSpeech(voiceId: string, text: string, options?: {
  modelId?: string;
}) {
  const client = getElevenLabsClient();
  
  return await client.textToSpeech.stream(voiceId, {
    text,
    modelId: options?.modelId || "eleven_multilingual_v2",
  });
}

// Helper function to create conversational agent
export async function createConversationalAgent(name: string, prompt: string) {
  const client = getElevenLabsClient();
  
  return await client.conversationalAi.agents.create({
    name,
    conversationConfig: {
      agent: {
        prompt: {
          prompt,
        },
      },
    },
  });
}
