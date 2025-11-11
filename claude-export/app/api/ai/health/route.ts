import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Wire to your real AI visibility testing endpoints
  // This should call your RankEmbed, Perplexity, ChatGPT, Claude APIs
  return NextResponse.json({
    aiHealth: [
      { platform: "ChatGPT", visibility: 0.88, latencyMs: 620 },
      { platform: "Claude", visibility: 0.84, latencyMs: 540 },
      { platform: "Perplexity", visibility: 0.81, latencyMs: 510 },
      { platform: "Gemini", visibility: 0.79, latencyMs: 580 },
    ],
  });
}
