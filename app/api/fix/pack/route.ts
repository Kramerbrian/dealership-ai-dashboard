import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { kinds?: string[]; domain?: string };
    const kinds = body.kinds?.length ? body.kinds : ["schema", "review", "cwv"];
    const jobs = kinds.map((k) => ({
      job_id: `job_${k}_${Date.now()}_${Math.floor(Math.random() * 9e3)}`,
      kind: k,
      status: "queued",
      estimated_completion: new Date(Date.now() + 30_000).toISOString()
    }));
    return NextResponse.json({ ok: true, domain: body.domain || null, jobs });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
