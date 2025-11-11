import { calculateElasticity, adjustWeights } from "./elasticity";
import { recordMarketEvent, getRecentMarketEvents, recordDealerImpact } from "./service";
import { MarketEvent, DealerModelImpact } from "./schemas";

/**
 * Market Pulse Radar: Detects market events and calculates impacts
 */
export class PulseRadar {
  /**
   * Detect potential market events from incoming signals
   */
  async detectEvent(signal: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    affectedDealers?: string[];
    metadata?: Record<string, any>;
  }): Promise<MarketEvent> {
    const event: MarketEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: signal.type as MarketEvent["type"],
      severity: signal.severity,
      detectedAt: new Date().toISOString(),
      affectedDealers: signal.affectedDealers,
      metadata: signal.metadata,
    };

    await recordMarketEvent(event);
    return event;
  }

  /**
   * Calculate impact forecast for a dealer based on market events
   */
  async forecastImpact(
    dealerId: string,
    modelId: string,
    historicalImpacts: Array<{ pillar: string; impact: number; eventType: string }>,
    currentEvent: MarketEvent
  ): Promise<DealerModelImpact> {
    const elasticityCoeffs = calculateElasticity(historicalImpacts);
    const adjustedWeights = adjustWeights(elasticityCoeffs, currentEvent.severity);

    const baseline: Record<string, any> = {
      weights: adjustedWeights,
      timestamp: new Date().toISOString(),
    };

    const forecast: Record<string, any> = {
      expectedQAIChange: this.estimateQAIChange(currentEvent, elasticityCoeffs),
      confidence: Math.max(...elasticityCoeffs.map((c) => c.confidence), 0.5),
      recommendedActions: this.generateRecommendations(currentEvent, elasticityCoeffs),
    };

    const impact: DealerModelImpact = {
      dealer_id: dealerId,
      model_id: modelId,
      timestamp: new Date(),
      baseline,
      forecast,
      confidence: forecast.confidence,
    };

    await recordDealerImpact(impact);
    return impact;
  }

  /**
   * Estimate QAI score change based on event and elasticity
   */
  private estimateQAIChange(
    event: MarketEvent,
    elasticityCoeffs: Array<{ pillar: string; β: number; confidence: number }>
  ): number {
    const severityImpact: Record<string, number> = {
      low: -1,
      medium: -3,
      high: -7,
      critical: -15,
    };

    const baseImpact = severityImpact[event.severity] || 0;
    const avgElasticity = elasticityCoeffs.reduce((sum, c) => sum + c.β, 0) / elasticityCoeffs.length;
    
    return baseImpact * (1 + avgElasticity);
  }

  /**
   * Generate recommended actions based on event and elasticity
   */
  private generateRecommendations(
    event: MarketEvent,
    elasticityCoeffs: Array<{ pillar: string; β: number; confidence: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (event.severity === "critical" || event.severity === "high") {
      recommendations.push("Immediate schema audit recommended");
      recommendations.push("Review competitor actions in affected market");
    }

    const highestElasticity = elasticityCoeffs.reduce((max, c) => 
      c.β > max.β ? c : max, elasticityCoeffs[0] || { pillar: "", β: 0, confidence: 0 }
    );

    if (highestElasticity.β > 0.5) {
      recommendations.push(`Focus optimization efforts on ${highestElasticity.pillar} pillar`);
    }

    return recommendations;
  }

  /**
   * Get recent market events radar view
   */
  async getRadarView(limit: number = 20) {
    const events = await getRecentMarketEvents(limit);
    return {
      events,
      summary: {
        total: events.length,
        bySeverity: {
          critical: events.filter((e) => e.severity === "critical").length,
          high: events.filter((e) => e.severity === "high").length,
          medium: events.filter((e) => e.severity === "medium").length,
          low: events.filter((e) => e.severity === "low").length,
        },
      },
    };
  }
}
