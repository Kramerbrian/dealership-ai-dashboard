import { NextResponse } from "next/server";
import { verifyQStashSignature } from "@/lib/queue/qstash";
import { updateReceiptFinalDelta, loadReceipt } from "@/lib/receipts/store";

/**
 * QStash will POST here.
 * Body: { tenantId, receiptId, pulseId, tier, summary, context }
 */
export async function POST(req: Request) {
  try {
    // 🔒 In production, verify Upstash signature:
    await verifyQStashSignature(req);

    const job = await req.json().catch(() => null);
    if (!job?.tenantId || !job?.receiptId || !job?.pulseId) {
      return NextResponse.json({ error: "bad payload" }, { status: 400 });
    }

    // no-op if already undone while queued
    const existing = await loadReceipt(job.tenantId, job.receiptId).catch(
      () => null
    );
    if (!existing || existing.undone) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Execute the fix (long task):
    // - call schema injector, review batch responder, etc.
    // - wait for measurement window or compute immediate expected delta
    // For demo: compute a synthetic final delta (±25% of projected)
    const projected = Number(existing.delta_usd || 0);
    const factor = 0.75 + Math.random() * 0.5; // 0.75 .. 1.25
    const finalDelta = Math.round(projected * factor);

    // Optionally update context with job metadata
    const contextPatch = {
      job: { processedAt: new Date().toISOString(), factor },
    };

    await updateReceiptFinalDelta(
      job.tenantId,
      job.receiptId,
      finalDelta,
      contextPatch
    );

    // Optional: Slack alert on success
    try {
      if (process.env.TELEMETRY_WEBHOOK) {
        await fetch(process.env.TELEMETRY_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `✅ Fix completed • ${job.summary} → +$${finalDelta.toLocaleString()}/mo • tenant ${job.tenantId}`,
          }),
        });
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      receiptId: job.receiptId,
      finalDelta,
    });
  } catch (e: any) {
    console.error("Fix consumer error:", e);
    return NextResponse.json(
      { error: e?.message || "consumer failed" },
      { status: 500 }
    );
  }
}

