import { db } from "@/lib/db";
import { MarketEvent, DealerModelImpact } from "./schemas";

export async function recordMarketEvent(event: MarketEvent): Promise<string> {
  try {
    // Store in MarketEvent table (add to Prisma schema if needed)
    // For now, use a generic table or create one
    const result = await db.$executeRawUnsafe(`
      INSERT INTO market_events (id, type, severity, detected_at, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        severity = EXCLUDED.severity,
        metadata = EXCLUDED.metadata
    `, event.id, event.type, event.severity, event.detectedAt, JSON.stringify(event.metadata || {}));

    return event.id;
  } catch (error: any) {
    // Fallback: use AgenticMetric as temporary storage
    console.warn("MarketEvent table not found, using fallback:", error.message);
    await db.agenticMetric.create({
      data: {
        dealerId: "system",
        metric: `market_event_${event.type}`,
        value: event.severity === "critical" ? 1 : event.severity === "high" ? 0.75 : event.severity === "medium" ? 0.5 : 0.25,
        ts: new Date(event.detectedAt),
      },
    });
    return event.id;
  }
}

export async function recordDealerImpact(impact: DealerModelImpact): Promise<void> {
  try {
    // Store in DealerModelImpact table
    await db.$executeRawUnsafe(`
      INSERT INTO dealer_model_impacts (dealer_id, model_id, timestamp, baseline, forecast, confidence)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      impact.dealer_id,
      impact.model_id,
      impact.timestamp,
      JSON.stringify(impact.baseline),
      JSON.stringify(impact.forecast),
      impact.confidence
    );
  } catch (error: any) {
    // Fallback: use AgenticMetric
    console.warn("DealerModelImpact table not found, using fallback:", error.message);
    await db.agenticMetric.create({
      data: {
        dealerId: impact.dealer_id,
        metric: `impact_${impact.model_id}`,
        value: impact.confidence,
        ts: impact.timestamp,
      },
    });
  }
}

export async function getRecentMarketEvents(limit: number = 10): Promise<MarketEvent[]> {
  try {
    const events = await db.$queryRawUnsafe<Array<{
      id: string;
      type: string;
      severity: string;
      detected_at: Date;
      metadata: any;
    }>>(`
      SELECT id, type, severity, detected_at, metadata
      FROM market_events
      ORDER BY detected_at DESC
      LIMIT $1
    `, limit);

    return events.map((e) => ({
      id: e.id,
      type: e.type as MarketEvent["type"],
      severity: e.severity as MarketEvent["severity"],
      detectedAt: e.detected_at.toISOString(),
      metadata: e.metadata,
    }));
  } catch (error: any) {
    console.warn("Failed to fetch market events:", error.message);
    return [];
  }
}

