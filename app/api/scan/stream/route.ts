import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * GET /api/scan/stream?domain=...  (SSE)
 * Emits progress events for agents in phases: aeo -> schema -> ugc -> geo -> cwv -> nap -> synthesize -> complete
 * Event format: data: {"type":"progress","agent":"aeo","status":"done","message":"AEO scan complete","pct":17}
 */
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain") || "exampledealer.com";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      }
      function heartbeat() {
        send({ type: "heartbeat", ts: Date.now() });
      }

      // kickoff
      send({ type: "start", domain, message: `Starting full scan for ${domain}` });

      // Phased simulation – replace with real orchestrator calls + awaits
      const phases = [
        { agent: "aeo",     label: "AEO (AI Answer/Citation scan)" },
        { agent: "schema",  label: "Schema validation" },
        { agent: "ugc",     label: "UGC sentiment & SLA" },
        { agent: "geo",     label: "GEO / NAP / GBP" },
        { agent: "cwv",     label: "Core Web Vitals" },
        { agent: "nap",     label: "Citation coherence" },
        { agent: "synth",   label: "Synthesizing results" }
      ];

      const step = 100 / (phases.length + 1);
      let pct = 0;

      for (const p of phases) {
        pct = Math.min(99, pct + step);
        send({ type: "progress", agent: p.agent, status: "running", message: `Running ${p.label}…`, pct: Math.round(pct) });

        // Simulate latency per phase (1.2–2.8s)
        await new Promise(r => setTimeout(r, 800 + Math.random() * 2000));

        // In real code, capture outputs/facts:
        const facts = p.agent === "aeo"
          ? { mention_rate: 74, zero_click: 38 }
          : p.agent === "schema"
          ? { coverage: 82, missing: ["FAQ", "HowTo"] }
          : p.agent === "ugc"
          ? { response_sla_mins: 490, velocity_wow: -23 }
          : p.agent === "geo"
          ? { three_pack_rate: 41, mismatches: 2 }
          : p.agent === "cwv"
          ? { lcp: "2.6s", inp: "180ms", cls: "0.12" }
          : p.agent === "nap"
          ? { conflicts: ["Facebook", "Yelp"] }
          : {};

        send({ type: "progress", agent: p.agent, status: "done", message: `${p.label} complete`, facts, pct: Math.round(pct) });
      }

      // Done
      send({
        type: "complete",
        message: "Cognitive scan complete",
        summary: {
          avi: 74,
          zero_click: 38,
          review_trust: 81,
          schema: 82,
          geo: 70,
          cwv: { lcp: "2.6s", inp: "180ms", cls: "0.12" },
          rar_monthly: 42800
        }
      });

      // keep connection stable briefly then close
      const hb = setInterval(heartbeat, 15000);
      setTimeout(() => {
        clearInterval(hb);
        controller.close();
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
