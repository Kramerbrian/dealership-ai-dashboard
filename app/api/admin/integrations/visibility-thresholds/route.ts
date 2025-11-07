import { NextResponse } from "next/server";
import { withAuth } from "../../../_utils/withAuth";
import { upsertIntegration, getIntegration } from "@/lib/integrations/store";

/**
 * Body: { thresholds: { ChatGPT?: { warn?:number, critical?:number }, ... } }
 * Persist into integrations.kind='visibility', metadata.visibility_thresholds
 */
export const POST = withAuth(async ({ req, tenantId }) => {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.thresholds) {
      return NextResponse.json({ error: "thresholds required" }, { status: 400 });
    }

    const integ = await getIntegration(tenantId, "visibility");
    const metadata = {
      ...(integ?.metadata || {}),
      visibility_thresholds: {
        ...(integ?.metadata?.visibility_thresholds || {}),
        ...body.thresholds
      }
    };
    await upsertIntegration({ tenantId, kind: "visibility", metadata });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to save thresholds" }, { status: 500 });
  }
});

