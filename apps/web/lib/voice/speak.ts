export async function speak(text: string) {
  try {
    if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || typeof window === 'undefined') return;

    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) return;

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.75, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true }
        })
      }
    );
    if (!res.ok) return;

    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
  } catch {
    // silent fail to avoid blocking UI
  }
}
