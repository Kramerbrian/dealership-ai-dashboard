"use client";

import React, { useState, useEffect } from "react";
import AIVForecastPanel from "@/components/dashboard/AIVForecastPanel";
import { useAIVCalculator, AIVInputs, AIVOutputs } from "@/hooks/useAIVCalculator";

interface AIVForecastPanelWrapperProps {
  dealerId: string;
}

/**
 * Wrapper component that fetches dealer data and calculates AIV metrics
 * to pass to AIVForecastPanel
 */
export default function AIVForecastPanelWrapper({ dealerId }: AIVForecastPanelWrapperProps) {
  const [inputs, setInputs] = useState<AIVInputs | null>(null);
  const [history, setHistory] = useState<Array<{ AIVR_score: number; timestamp?: Date | string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current metrics
        const response = await fetch(`/api/ai-scores?dealerId=${dealerId}`);
        if (response.ok) {
          const data = await response.json();
          setInputs(data as AIVInputs);
        } else {
          // Use fallback
          setInputs(getFallbackInputs(dealerId));
        }

        // Fetch historical AIVR data (mock for now - replace with actual API)
        // TODO: Replace with actual historical data endpoint
        const mockHistory = Array.from({ length: 6 }, (_, i) => ({
          AIVR_score: 0.85 + Math.random() * 0.1 - 0.05,
          timestamp: new Date(Date.now() - (5 - i) * 7 * 24 * 60 * 60 * 1000)
        }));
        setHistory(mockHistory);
      } catch (error) {
        console.error('Failed to fetch AIV data:', error);
        setInputs(getFallbackInputs(dealerId));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dealerId]);

  const results = useAIVCalculator(inputs);

  if (loading || !results || results.AIV_score === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <AIVForecastPanel
      currentMetrics={results}
      history={history}
    />
  );
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


import React, { useState, useEffect } from "react";
import AIVForecastPanel from "./AIVForecastPanel";
import { useAIVCalculator, AIVInputs } from "@/hooks/useAIVCalculator";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current dealer metrics
        const response = await fetch(`/api/ai-scores?dealerId=${dealerId}`);
        if (response.ok) {
          const data = await response.json();
          setInputs(data);
        } else {
          // Use fallback demo data
          setInputs(getFallbackInputs(dealerId));
        }

        // Fetch historical AIVR data (you can replace this with your actual endpoint)
        // For now, generate mock history
        const mockHistory = generateMockHistory();
        setHistory(mockHistory);
      } catch (error) {
        console.error('Failed to fetch AIV forecast data:', error);
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return <AIVForecastPanel currentMetrics={results} history={history} />;
}

/**
 * Generate mock historical data for demonstration
 */
function generateMockHistory(): Array<{ AIVR_score: number; timestamp: Date }> {
  const history: Array<{ AIVR_score: number; timestamp: Date }> = [];
  const now = new Date();
  
  // Generate 6 months of historical data
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Generate realistic AIVR scores (0.75 to 0.95 range)
    const baseScore = 0.75 + Math.random() * 0.2;
    history.push({
      AIVR_score: parseFloat(baseScore.toFixed(3)),
      timestamp: date
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

