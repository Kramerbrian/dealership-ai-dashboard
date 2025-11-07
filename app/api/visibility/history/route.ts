import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain") || "example.com";
  // TODO: replace with your presence history (store last N presence snapshots)
  const today = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(today.getTime() - (6 - i) * 24 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // synthetic AIV: 80..92 with gentle wiggle
  const base = 86;
  const series = days.map((_, i) => base + Math.round(Math.sin(i) * 4));
  return NextResponse.json({ domain, days, aiv: series });
});

