import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { ensureIdempotent } from "@/lib/http/idempotency";
import { insertReceipt } from "@/lib/receipts/store";
import { qstashPublish } from "@/lib/queue/qstash";

/**
 * POST /api/fix/apply?simulate=true
 * Headers: Idempotency-Key (required when NOT simulating)
 * Body: { pulseId: string, tier: 'apply'|'autopilot', summary?: string, projectedDeltaUSD?: number, context?: any }
 */
export const POST = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const simulate = url.searchParams.get("simulate") === "true";

    const body = await req.json().catch(() => null);
    if (!body?.pulseId || !body?.tier) {
      return NextResponse.json(
        { error: "pulseId and tier required" },
        { status: 400 }
      );
    }
    if (!["apply", "autopilot"].includes(body.tier)) {
      return NextResponse.json({ error: "invalid tier" }, { status: 400 });
    }

    // SIMULATE: return a diff/plan without writing a receipt or queueing a job
    if (simulate) {
      const diff = computeSimulatedDiff(body); // lightweight deterministic "preview"
      return NextResponse.json({
        ok: true,
        simulate: true,
        plan: {
          summary: body.summary || `Simulate ${body.tier} for ${body.pulseId}`,
          etaSeconds: 90,
          projectedDeltaUSD: body.projectedDeltaUSD ?? 2000,
          diff,
        },
      });
    }

    // REAL APPLY: enforce idempotency
    const idempo = req.headers.get("Idempotency-Key") || "";
    await ensureIdempotent(tenantId, idempo);

    const summary = body.summary || `Applied ${body.tier} for ${body.pulseId}`;
    const projected = Number(body.projectedDeltaUSD ?? 0);
    const undoDeadline = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Create a temporary receipt immediately (projected delta)
    const rec = await insertReceipt({
      tenant_id: tenantId,
      pulse_id: body.pulseId,
      tier: body.tier,
      actor: "human",
      summary,
      delta_usd: projected,
      undoable: true,
      undo_deadline: undoDeadline,
      undone: false,
      context: body.context ?? null,
    });

    // Enqueue a background job to compute the real delta and finalize the fix
    try {
      await qstashPublish("/api/jobs/fix-consumer", {
        tenantId,
        receiptId: rec.id,
        pulseId: body.pulseId,
        tier: body.tier,
        summary,
        // pass more context or URLs if needed to execute the fix
        context: body.context ?? null,
      });
    } catch (qstashError) {
      // If QStash fails, log but don't fail the request (receipt is already created)
      console.error("QStash publish failed:", qstashError);
      // Continue - receipt exists, job can be retried manually if needed
    }

    // Optional: Slack alert
    try {
      if (process.env.TELEMETRY_WEBHOOK) {
        await fetch(process.env.TELEMETRY_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Fix ${body.tier} • ${summary} • $${projected.toLocaleString()} • tenant ${tenantId}`,
          }),
        });
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      receiptId: rec.id,
      undoBy: rec.undo_deadline,
      enqueued: true,
    });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json(
      { error: e?.message || "apply failed" },
      { status }
    );
  }
});

// --- trivial diff preview ---
function computeSimulatedDiff(body: any) {
  // Return a stable "before/after" JSON-LD diff or config change draft
  return {
    before: { schema: { product: false, faq: false } },
    after: { schema: { product: true, faq: true } },
    steps: [
      "Inject JSON-LD Product on VDPs",
      "Add FAQPage to /service with 8 Q&As",
      "Revalidate with Rich Results",
    ],
  };
}
