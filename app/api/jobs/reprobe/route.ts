import { NextResponse } from "next/server";
export async function POST(req: Request){
  const body = await req.json(); // { tenantId, scope: "schema"|"cwv"|"crawl" }
  // TODO: enqueue reprobe job
  return NextResponse.json({ accepted: true, jobId: `reprobe-${Date.now()}`, received: body }, { status: 202 });
}

