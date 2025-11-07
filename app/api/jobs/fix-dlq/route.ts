import { NextResponse } from "next/server";
import { verifySignature } from "@upstash/qstash/nextjs";
import { updateReceiptFinalDelta, loadReceipt } from "@/lib/receipts/store";

export const runtime = "nodejs";

async function dlqHandler(req: Request) {
  const body = await req.json().catch(() => null);
  // QStash sends original payload (we published) under body (by default you control what you send)
  const job = body?.body || body || null;

  // Minimal fields required to correlate
  const tenantId = job?.tenantId;
  const receiptId = job?.receiptId;
  const errorMsg = body?.error || "unknown";

  // Try annotating the receipt with failure context (non-fatal if missing)
  if (tenantId && receiptId) {
    try {
      const r = await loadReceipt(tenantId, receiptId);
      if (r && !r.undone) {
        await updateReceiptFinalDelta(tenantId, receiptId, Number(r.delta_usd || 0), {
          job: { failedAt: new Date().toISOString(), error: String(errorMsg).slice(0, 500) },
        });
      }
    } catch {}
  }

  // Optional Slack alert
  try {
    if (process.env.TELEMETRY_WEBHOOK) {
      await fetch(process.env.TELEMETRY_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: [
            "🚨 DealershipAI • Fix DLQ",
            tenantId ? `Tenant: ${tenantId}` : "",
            receiptId ? `Receipt: ${receiptId}` : "",
            `Error: ${errorMsg}`,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
    }
  } catch {}

  return NextResponse.json({ ok: true });
}

export const POST = verifySignature(dlqHandler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

