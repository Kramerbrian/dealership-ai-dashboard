import { NextResponse } from "next/server";

export async function GET() {
  // optionally ping redis, db, version, qstash token presence
  const qstashOk = !!process.env.QSTASH_TOKEN;
  const redisOk = !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  const supabaseOk = !!(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
  );

  return NextResponse.json({
    ok: qstashOk && redisOk && supabaseOk,
    qstash: qstashOk ? "configured" : "missing",
    redis: redisOk ? "configured" : "missing",
    supabase: supabaseOk ? "configured" : "missing",
    version: process.env.VERCEL_GIT_COMMIT_SHA || "dev",
  });
}
