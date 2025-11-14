import { NextRequest } from "next/server";

import { runLLM } from "@/lib/agents/llmClient";

export const runtime = "edge";

/**
 * Streams JSON events instead of plain text.
 * Each event looks like:  data: {"event":"update","data":{"partial":"..."}}\n\n
 */
export async function POST(req: NextRequest) {
  try {
    const { provider, model, messages, maxTokens } = await req.json();
    const stream = (await runLLM(provider, model, messages, {
      stream: true,
      maxTokens: maxTokens || 1024,
    })) as AsyncGenerator<string>;

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let accumulatedText = "";
        try {
          for await (const chunk of stream) {
            accumulatedText += chunk;
            const evt = JSON.stringify({
              event: "update",
              data: { partial: chunk },
            });
            controller.enqueue(encoder.encode(`data: ${evt}\n\n`));
          }

          // After done loop, attempt final parse for structured JSON
          try {
            const parsedJSON = JSON.parse(
              accumulatedText.replace(/^.*?(\{)/s, "$1")
            );
            const finalEvt = JSON.stringify({
              event: "final_json",
              data: parsedJSON,
            });
            controller.enqueue(encoder.encode(`data: ${finalEvt}\n\n`));
          } catch {
            // If final JSON parse fails, just send done event
            const doneEvt = JSON.stringify({ event: "done" });
            controller.enqueue(encoder.encode(`data: ${doneEvt}\n\n`));
          }
        } catch (err) {
          const errEvt = JSON.stringify({
            event: "error",
            data: { message: (err as Error).message },
          });
          controller.enqueue(encoder.encode(`data: ${errEvt}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e: any) {
    console.error("[LLM JSON Stream] failed", e);
    return new Response(
      JSON.stringify({ ok: false, error: e?.message ?? "unknown_error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

