import { NextResponse } from "next/server";
import { verifySignature } from "@upstash/qstash/nextjs";
import { updateReceiptFinalDelta, loadReceipt } from "@/lib/receipts/store";

export const runtime = "nodejs"; // ensure Node runtime for crypto

async function handler(req: Request) {
  const job = await req.json().catch(() => null);
  if (!job?.tenantId || !job?.receiptId || !job?.pulseId) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  // skip if user pressed Undo during queue delay
  const existing = await loadReceipt(job.tenantId, job.receiptId).catch(
    () => null
  );
  if (!existing || existing.undone) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // 🔧 Execute long fix (replace with real logic)
  const projected = Number(existing.delta_usd || 0);
  const factor = 0.75 + Math.random() * 0.5; // 0.75..1.25
  const finalDelta = Math.round(projected * factor);

  await updateReceiptFinalDelta(job.tenantId, job.receiptId, finalDelta, {
    job: { processedAt: new Date().toISOString(), factor },
  });

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
}

// 🔒 QStash signature verification wrapper
export const POST = verifySignature(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

