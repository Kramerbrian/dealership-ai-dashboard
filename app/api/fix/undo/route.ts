import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { loadReceipt, markUndone } from "@/lib/receipts/store";

/**
 * Body: { receiptId: string }
 * Only allowed if undoable and within undo_deadline.
 */
export const POST = withAuth(async ({ req, tenantId }) => {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.receiptId) {
      return NextResponse.json(
        { error: "receiptId required" },
        { status: 400 }
      );
    }
    const rec = await loadReceipt(tenantId, body.receiptId);

    if (!rec)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    if (rec.undone)
      return NextResponse.json({ error: "already undone" }, { status: 409 });
    if (!rec.undoable || !rec.undo_deadline) {
      return NextResponse.json({ error: "not undoable" }, { status: 409 });
    }

    const now = Date.now();
    const deadline = new Date(rec.undo_deadline).getTime();
    if (now > deadline) {
      return NextResponse.json(
        { error: "undo window expired" },
        { status: 409 }
      );
    }

    // Perform reverse op here (e.g., revert schema change)
    const updated = await markUndone(tenantId, rec.id);

    // Optional: Slack alert
    try {
      if (process.env.TELEMETRY_WEBHOOK) {
        await fetch(process.env.TELEMETRY_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Fix undone • ${rec.summary} • tenant ${tenantId}`,
          }),
        });
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      receiptId: updated.id,
      undone: true,
    });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json(
      { error: e?.message || "undo failed" },
      { status }
    );
  }
});
