// app/api/orchestrator/snapshot/route.ts

import { NextResponse } from "next/server";
import { buildDiagnosticsPayload } from "@/lib/orchestrator/snapshot-helpers";
import { fetchPulse } from "@/lib/orchestrator/snapshot-helpers";
import { getMsrpState } from "@/lib/orchestrator/snapshot-helpers";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const diagnostics = await buildDiagnosticsPayload();
  const pulse = await fetchPulse({ window: "7d" });
  const msrpSync = await getMsrpState();
  const graph = { dealers: 0, intents: 0, fixes: 0, edges: 0, updateTs: new Date().toISOString() };
  const freshnessScore = 0.95;
  const businessIdentityMatch = 0.99;

  const body = {
    freshnessScore,
    businessIdentityMatch,
    pulse,
    msrpSync,
    graph,
    diagnostics,
    meta: { version: process.env.SNAPSHOT_VERSION ?? new Date().toISOString(), source: "AppraiseYourVehicleOrchestrator", sdkCompatible: true }
  };

  const json = JSON.stringify(body);
  const etag = `"${await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json)).then(b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''))}"`;
  const ifNone = new Headers(req.headers).get("If-None-Match");
  if (ifNone && ifNone === etag) return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control":"public,max-age=60, s-maxage=120" }});

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, s-maxage=120",
      "ETag": etag
    }
  });
}

