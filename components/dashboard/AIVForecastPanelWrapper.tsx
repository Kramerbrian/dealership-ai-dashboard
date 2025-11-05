"use client";

import React, { useState, useEffect } from "react";
import AIVForecastPanel from "./AIVForecastPanel";
import { useAIVCalculator, AIVInputs, AIVOutputs } from "@/hooks/useAIVCalculator";

interface AIVForecastPanelWrapperProps {
  dealerId: string;
}

/**
 * Wrapper component that fetches dealer data and provides it to AIVForecastPanel
 */
export default function AIVForecastPanelWrapper({ dealerId }: AIVForecastPanelWrapperProps) {
  const [inputs, setInputs] = useState<AIVInputs | null>(null);
  const [history, setHistory] = useState<Array<{ AIVR_score: number; timestamp?: Date | string }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current metrics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current AIV data
        const response = await fetch(`/api/ai-scores?dealerId=${dealerId}`);
        if (response.ok) {
          const data = await response.json();
          setInputs(data as AIVInputs);
        } else {
          // Use fallback demo data
          setInputs(getFallbackInputs(dealerId));
        }

        // Fetch historical AIVR data (TODO: Replace with actual API endpoint)
        // For now, generate mock history
        const mockHistory = generateMockHistory();
        setHistory(mockHistory);
      } catch (error) {
        console.error("Failed to fetch AIV data:", error);
        setInputs(getFallbackInputs(dealerId));
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dealerId]);

  const results = useAIVCalculator(inputs);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 animate-pulse">
        <div className="h-32 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (!results || results.AIV_score === 0) {
    return null; // Don't show forecast if no data
  }

  return <AIVForecastPanel currentMetrics={results} history={history} />;
}

/**
 * Generate mock historical AIVR data for demonstration
 * TODO: Replace with actual API call to fetch historical data
 */
function generateMockHistory(): Array<{ AIVR_score: number; timestamp: Date }> {
  const history = [];
  const now = new Date();
  const baseScore = 0.85; // Starting AIVR score

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7); // Weekly data points
    const score = baseScore + (Math.random() * 0.1 - 0.05); // Small variations
    history.push({
      AIVR_score: Math.min(1, Math.max(0, score)),
      timestamp: date,
    });
  }

  return history;
}

/**
 * Fallback inputs for demo/error states
 */
function getFallbackInputs(dealerId: string): AIVInputs {
  return {
    dealerId,
    platform_scores: {
      chatgpt: 0.86,
      claude: 0.82,
      gemini: 0.84,
      perplexity: 0.78,
      copilot: 0.75,
      grok: 0.70,
    },
    google_aio_inclusion_rate: 0.62,
    ugc_health_score: 84,
    schema_coverage_ratio: 0.91,
    semantic_clarity_score: 0.88,
    silo_integrity_score: 0.82,
    authority_depth_index: 0.87,
    temporal_weight: 1.05,
    entity_confidence: 0.96,
    crawl_budget_mult: 0.98,
    inventory_truth_mult: 1.0,
    ctr_delta: 0.094,
    conversion_delta: 0.047,
    avg_gross_per_unit: 1200,
    monthly_opportunities: 450,
  };
}

