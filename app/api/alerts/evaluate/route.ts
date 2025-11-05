// /app/api/alerts/evaluate/route.ts

import { NextResponse } from "next/server";
import { SMART_ALERTS } from "@/lib/smartAlerts";

type Input = {
  dealerId: string;
  deltas: { competitor: string; delta24h: number }[];
  website: { down: boolean; errorsSpike: boolean };
  rank: { you: number; competitor: string; youOvertook: boolean };
};

export async function POST(req: Request) {
  const body = (await req.json()) as Input;
  const out: any[] = [];

  // urgent
  body.deltas.filter(d => d.delta24h >= 10).forEach(d =>
    out.push({ type: "urgent", competitor: d.competitor, message: `${d.competitor} gained ${d.delta24h} pts in 24h`, channels: SMART_ALERTS.types.urgent.channels })
  );
  // opportunity
  body.deltas.filter(d => d.delta24h <= -5).forEach(d =>
    out.push({ type: "opportunity", competitor: d.competitor, message: `Opportunity: ${d.competitor} dropped ${Math.abs(d.delta24h)} pts`, suggested_action: SMART_ALERTS.types.opportunity.suggested_action })
  );
  // milestone
  if (body.rank.youOvertook) out.push({ type: "milestone", message: SMART_ALERTS.types.milestone.message, auto_share: true });
  // maintenance
  if (body.website.down || body.website.errorsSpike) out.push({ type: "maintenance", priority: "critical", escalation: true });

  return NextResponse.json({ alerts: out });
}

