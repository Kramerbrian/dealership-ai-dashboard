export async function speak(text: string) {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('ElevenLabs API key not configured');
    return;
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/6401k82m0br0eeybfe14arvvqmmj`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0,
          use_speaker_boost: true
        }
      })
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs API error: ${res.status}`);
    }

    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: 'audio/mpeg' });
    const audio = new Audio(URL.createObjectURL(blob));
    await audio.play();
  } catch (error) {
    console.error('Voice synthesis error:', error);
  }
}

