import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { kind, domain } = (await req.json()) as {
      kind: "schema" | "review" | "cwv" | "nap";
      domain?: string;
    };
    if (!kind) return NextResponse.json({ error: "Missing kind" }, { status: 400 });

    const job = {
      job_id: `job_${kind}_${Date.now()}`,
      kind,
      domain: domain || null,
      status: "queued",
      estimated_completion: new Date(Date.now() + 30_000).toISOString()
    };
    return NextResponse.json({ ok: true, ...job });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
