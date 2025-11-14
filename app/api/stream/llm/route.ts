import { NextRequest } from "next/server";

import { runLLM } from "@/lib/agents/llmClient";

export const runtime = "edge"; // optional – enables low-latency streaming

export async function POST(req: NextRequest) {
  try {
    const { provider, model, messages, maxTokens } = await req.json();

    // Run model in streaming mode
    const stream = (await runLLM(provider, model, messages, {
      stream: true,
      maxTokens: maxTokens || 1024,
    })) as AsyncGenerator<string>;

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) controller.enqueue(encoder.encode(chunk));
        } catch (err) {
          controller.enqueue(encoder.encode(`[Stream error] ${(err as Error).message}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e: any) {
    console.error("[LLMStreamProxy] failed", e);
    return new Response(
      JSON.stringify({ ok: false, error: e?.message ?? "unknown_error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

