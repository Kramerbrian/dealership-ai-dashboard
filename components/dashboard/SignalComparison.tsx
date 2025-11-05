'use client';

import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface SignalComparisonProps {
  current: {
    review_credibility: { avg: number; responses: number; response_rate: number };
    structured_data_age: string;
    local_entity_consistency: string;
    ai_visibility: number;
    decay_tax: number;
  };
  ideal?: {
    review_credibility: { avg: number; response_rate: number };
    structured_data_age: string;
    local_entity_consistency: string;
    ai_visibility: number;
    decay_tax: number;
  };
  peerAvg?: {
    review_credibility: { avg: number; response_rate: number };
    structured_data_age: string;
    local_entity_consistency: number;
    ai_visibility: number;
    decay_tax: number;
  };
}

export function SignalComparison({ current, ideal, peerAvg }: SignalComparisonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                  dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Trust Signal Analysis
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Current performance vs. ideal targets and peer averages
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Signal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current
              </th>
              {ideal && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ideal
                </th>
              )}
              {peerAvg && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Peer Avg
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Review Credibility */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Review Credibility
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {current.review_credibility.avg.toFixed(1)}★ avg / {current.review_credibility.responses} reviews / {current.review_credibility.response_rate}% response rate
              </td>
              {ideal && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {ideal.review_credibility.avg.toFixed(1)}★ avg / {ideal.review_credibility.response_rate}% response rate
                </td>
              )}
              {peerAvg && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {peerAvg.review_credibility.avg.toFixed(1)}★ avg / {peerAvg.review_credibility.response_rate}% response rate
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(
                  current.review_credibility.avg,
                  ideal?.review_credibility.avg,
                  peerAvg?.review_credibility.avg
                )}
              </td>
            </tr>

            {/* Structured Data Age */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Structured Data Age
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {current.structured_data_age}
              </td>
              {ideal && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {ideal.structured_data_age}
                </td>
              )}
              {peerAvg && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {peerAvg.structured_data_age}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {getAgeStatusBadge(current.structured_data_age, ideal?.structured_data_age)}
              </td>
            </tr>

            {/* Local Entity Consistency */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Local Entity Consistency
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {current.local_entity_consistency}
              </td>
              {ideal && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {ideal.local_entity_consistency}
                </td>
              )}
              {peerAvg && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {peerAvg.local_entity_consistency}% accuracy
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {getConsistencyStatusBadge(current.local_entity_consistency)}
              </td>
            </tr>

            {/* AI Visibility */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                AI Visibility
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {current.ai_visibility}% of AI queries show listing
              </td>
              {ideal && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {ideal.ai_visibility}%
                </td>
              )}
              {peerAvg && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {peerAvg.ai_visibility}%
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {getVisibilityStatusBadge(current.ai_visibility, ideal?.ai_visibility, peerAvg?.ai_visibility)}
              </td>
            </tr>

            {/* Decay Tax */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Decay Tax
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {current.decay_tax > 0 ? '+' : ''}{current.decay_tax}% {current.decay_tax > 10 ? '(aging content penalty)' : '(normal aging)'}
              </td>
              {ideal && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  ≤ {ideal.decay_tax}%
                </td>
              )}
              {peerAvg && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {peerAvg.decay_tax > 0 ? '+' : ''}{peerAvg.decay_tax}% (avg)
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {getDecayStatusBadge(current.decay_tax, ideal?.decay_tax, peerAvg?.decay_tax)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Negative Impact
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Conflicting data sources, slow response times, and outdated content reduce AI citations and search visibility.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Positive Impact
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Unified entities, verified reviews, and auto-refresh reduce decay penalty and compound trust growth.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Result
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {current.ai_visibility >= 70 ? 'Maintaining' : 'Improving'} these signals drives compounding trust and AI inclusion growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(current: number, ideal?: number, peerAvg?: number) {
  if (ideal && current >= ideal) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ On Target</span>;
  }
  if (ideal && current < ideal * 0.9) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">⚠ Needs Work</span>;
  }
  if (peerAvg && current >= peerAvg) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">↑ Above Avg</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">○ Average</span>;
}

function getAgeStatusBadge(current: string, ideal?: string) {
  const currentMonths = parseMonths(current);
  const idealMonths = ideal ? parseMonths(ideal) : 3;
  
  if (currentMonths <= idealMonths) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Fresh</span>;
  }
  if (currentMonths <= idealMonths * 2) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">⚠ Stale</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">❌ Outdated</span>;
}

function parseMonths(ageStr: string): number {
  const match = ageStr.match(/(\d+)\s*month/i);
  return match ? parseInt(match[1]) : 999;
}

function getConsistencyStatusBadge(consistency: string) {
  if (consistency.toLowerCase().includes('perfect') || consistency.toLowerCase().includes('unified')) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Unified</span>;
  }
  if (consistency.toLowerCase().includes('mismatch')) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">⚠ Mismatch</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">○ Partial</span>;
}

function getVisibilityStatusBadge(current: number, ideal?: number, peerAvg?: number) {
  if (ideal && current >= ideal) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Excellent</span>;
  }
  if (peerAvg && current >= peerAvg) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">↑ Above Avg</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">⚠ Low</span>;
}

function getDecayStatusBadge(current: number, ideal?: number, peerAvg?: number) {
  if (ideal && current <= ideal) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Normal</span>;
  }
  if (current > 20) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">❌ High Penalty</span>;
  }
  if (peerAvg && current <= peerAvg) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">↑ Better</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">⚠ Elevated</span>;
}

