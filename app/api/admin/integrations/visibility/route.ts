import { NextResponse } from "next/server";
import { withAuth } from "../../../_utils/withAuth";
import { upsertIntegration, getIntegration } from "@/lib/integrations/store";

/**
 * Body: { engines: { ChatGPT?: boolean, Perplexity?: boolean, Gemini?: boolean, Copilot?: boolean } }
 * Persist into integrations.kind='visibility', metadata.enabled_engines
 */
export const POST = withAuth(async ({ req, tenantId }) => {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.engines) {
      return NextResponse.json({ error: "engines required" }, { status: 400 });
    }

    const integ = await getIntegration(tenantId, "visibility");
    const metadata = {
      ...(integ?.metadata || {}),
      enabled_engines: {
        ...(integ?.metadata?.enabled_engines || {}),
        ...body.engines
      }
    };
    await upsertIntegration({ tenantId, kind: "visibility", metadata });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to save engine preferences" }, { status: 500 });
  }
});

export const GET = withAuth(async ({ tenantId }) => {
  try {
    const integ = await getIntegration(tenantId, "visibility");
    return NextResponse.json({
      enabled_engines: integ?.metadata?.enabled_engines || {
        ChatGPT: true,
        Perplexity: true,
        Gemini: true,
        Copilot: true
      },
      visibility_thresholds: integ?.metadata?.visibility_thresholds || null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load preferences" }, { status: 500 });
  }
});
