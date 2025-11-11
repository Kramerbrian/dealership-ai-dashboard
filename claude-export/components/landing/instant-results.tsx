"use client";

import { Share2, TrendingUp } from "lucide-react";

interface InstantResultsProps {
  domain: string;
  results: {
    score: number;
    breakdown?: Record<string, number>;
    insights?: string[];
  };
  onShare: () => void;
}

export default function InstantResults({ domain, results, onShare }: InstantResultsProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Visibility Score</h2>
          <p className="text-slate-600 dark:text-slate-400">{domain}</p>
        </div>
        <button
          onClick={onShare}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4">
          <span className="text-5xl font-bold text-white">{results.score}</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {results.score >= 80
            ? "Excellent AI visibility"
            : results.score >= 60
            ? "Good, but room for improvement"
            : "Needs attention"}
        </p>
      </div>

      {results.breakdown && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Object.entries(results.breakdown).map(([platform, score]) => (
            <div
              key={platform}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
            >
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1 capitalize">
                {platform}
              </div>
              <div className="text-2xl font-bold">{score}%</div>
            </div>
          ))}
        </div>
      )}

      {results.insights && results.insights.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Insights
          </h3>
          <ul className="space-y-2">
            {results.insights.map((insight, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

