import { NextResponse } from "next/server";
import { withAuth } from "../../../_utils/withAuth";
import { loadReceipt } from "@/lib/receipts/store";

export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const rec = await loadReceipt(tenantId, id).catch(() => null);
    if (!rec)
      return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({
      id: rec.id,
      summary: rec.summary,
      deltaUSD: rec.delta_usd,
      undone: rec.undone,
      undoable: rec.undoable,
      undoDeadline: rec.undo_deadline,
      createdAt: rec.created_at,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "status check failed" },
      { status: 500 }
    );
  }
});

