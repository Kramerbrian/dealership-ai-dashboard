'use client';

import { useEffect, useState } from 'react';

interface EngineData {
  as_of: string;
  chatgpt_pct: number;
  gemini_pct: number;
  perplexity_pct: number;
  copilot_pct: number;
  iqr_mean_pct: number;
  spread_pct: number;
}

interface EngineSuggestion {
  engine: string;
  delta: number;
  isPositive: boolean;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

export default function EngineSuggestionsPanel({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<EngineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenants/${tenantId}/aiv/engines/latest`)
      .then(r => r.json())
      .then(j => {
        setData(j.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantId]);

  const generateSuggestions = (data: EngineData): EngineSuggestion[] => {
    const consensus = data.iqr_mean_pct;
    const engines = [
      { name: 'ChatGPT', value: data.chatgpt_pct },
      { name: 'Gemini', value: data.gemini_pct },
      { name: 'Perplexity', value: data.perplexity_pct },
      { name: 'Copilot', value: data.copilot_pct }
    ];

    return engines.map(engine => {
      const delta = engine.value - consensus;
      const isPositive = delta > 0;
      const absDelta = Math.abs(delta);
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (absDelta > 3) priority = 'high';
      else if (absDelta > 1.5) priority = 'medium';

      const suggestions = getEngineSpecificSuggestions(engine.name, delta, absDelta);

      return {
        engine: engine.name,
        delta,
        isPositive,
        suggestions,
        priority
      };
    }).filter(s => Math.abs(s.delta) > 1); // Only show engines with significant deltas
  };

  const getEngineSpecificSuggestions = (engine: string, delta: number, absDelta: number): string[] => {
    const suggestions: string[] = [];
    
    if (engine === 'ChatGPT') {
      if (delta < -2) {
        suggestions.push('Increase citation density in content');
        suggestions.push('Add more authoritative backlinks');
        suggestions.push('Improve content depth and expertise signals');
      } else if (delta > 2) {
        suggestions.push('Optimize for conversational queries');
        suggestions.push('Add FAQ sections with natural language');
      }
    } else if (engine === 'Gemini') {
      if (delta < -2) {
        suggestions.push('Increase FAQ markup density');
        suggestions.push('Add structured data for local business');
        suggestions.push('Optimize for factual, data-driven content');
      } else if (delta > 2) {
        suggestions.push('Focus on technical accuracy');
        suggestions.push('Add more factual verification');
      }
    } else if (engine === 'Perplexity') {
      if (delta < -2) {
        suggestions.push('Add more recent, cited sources');
        suggestions.push('Improve content freshness signals');
        suggestions.push('Include more current data and statistics');
      } else if (delta > 2) {
        suggestions.push('Optimize for research-style queries');
        suggestions.push('Add more comprehensive coverage');
      }
    } else if (engine === 'Copilot') {
      if (delta < -2) {
        suggestions.push('Add more code examples and technical content');
        suggestions.push('Improve developer-focused documentation');
        suggestions.push('Include more technical specifications');
      } else if (delta > 2) {
        suggestions.push('Focus on practical, actionable content');
        suggestions.push('Add more step-by-step guides');
      }
    }

    // Add general suggestions based on delta magnitude
    if (absDelta > 3) {
      suggestions.push('Review content quality and relevance');
      suggestions.push('Check for technical SEO issues');
    }

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  };

  if (loading) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium mb-3">Engine-Specific Suggestions</div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium mb-3">Engine-Specific Suggestions</div>
        <div className="text-sm text-gray-500">No engine data available</div>
      </div>
    );
  }

  const suggestions = generateSuggestions(data);

  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium mb-3">Engine-Specific Suggestions</div>
        <div className="text-sm text-green-600">✅ All engines performing within normal range</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-medium mb-3">Engine-Specific Suggestions</div>
      
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.engine} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{suggestion.engine}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  suggestion.isPositive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {suggestion.isPositive ? '+' : ''}{suggestion.delta.toFixed(1)} pts
                </span>
              </div>
              
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {suggestion.priority} priority
              </span>
            </div>
            
            <div className="space-y-1">
              {suggestion.suggestions.map((suggestionText, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{suggestionText}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-100">
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View detailed recommendations →
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Based on consensus: {data.iqr_mean_pct.toFixed(1)}% • Spread: {data.spread_pct.toFixed(1)} pts
        </div>
      </div>
    </div>
  );
}
