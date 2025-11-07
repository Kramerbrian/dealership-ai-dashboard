// app/api/visibility/presence/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { cacheJSON } from "@/lib/cache";
import { getIntegration } from "@/lib/integrations/store";

type VisibilityPresence = {
  domain: string;
  engines: Array<{ name: "ChatGPT" | "Perplexity" | "Gemini" | "Copilot"; presencePct: number }>;
  lastCheckedISO: string;
  connected: boolean;
};

export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain") || "example.com";

    // Load tenant engine preferences
    const integ = await getIntegration(tenantId, "visibility");
    const enabledEngines = integ?.metadata?.enabled_engines || {
      ChatGPT: true,
      Perplexity: true,
      Gemini: true,
      Copilot: true
    };

    const key = `visibility:${tenantId}:${domain}`;
    const synthetic = await cacheJSON(key, 120, async () => {
      // TODO: Plug in your presence service here (citations/answers/panel).
      const allEngines = [
        { name: "ChatGPT" as const, presencePct: 89 },
        { name: "Perplexity" as const, presencePct: 78 },
        { name: "Gemini" as const, presencePct: 72 },
        { name: "Copilot" as const, presencePct: 64 },
      ];

      // Filter by tenant preferences
      const engines = allEngines.filter(e => enabledEngines[e.name] !== false);

      const synthetic: VisibilityPresence = {
        domain,
        engines,
        lastCheckedISO: new Date().toISOString(),
      };
      return synthetic;
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
});
