'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompetitorData {
  name: string;
  vai: number;
  geo: number;
  aeo: number;
  seo: number;
  anonymized: boolean;
}

interface ComparisonData {
  prospect: {
    vai: number;
    geo: number;
    aeo: number;
    seo: number;
  };
  competitors: CompetitorData[];
  position: string;
  message: string;
}

interface CompetitiveComparisonWidgetProps {
  domain?: string;
  dealerId?: string;
  className?: string;
}

export default function CompetitiveComparisonWidget({
  domain,
  dealerId,
  className = ''
}: CompetitiveComparisonWidgetProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain && !dealerId) {
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/demo/competitor-comparison', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, dealerId })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }

        const comparisonData = await response.json();
        setData(comparisonData);
      } catch (err) {
        console.error('Failed to fetch competitor comparison:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [domain, dealerId]);

  if (!domain && !dealerId) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow-sm ${className}`}>
        <p className="text-sm text-gray-500">Enter a domain to see competitive comparison</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading competitive comparison...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur p-6 shadow-sm ${className}`}>
        <p className="text-sm text-red-600">
          {error || 'Failed to load comparison data'}
        </p>
      </div>
    );
  }

  // Determine position color
  const positionNum = parseInt(data.position.split(' ')[0]);
  const totalNum = parseInt(data.position.split(' ')[2]);
  const percentile = (positionNum / totalNum) * 100;
  const positionColor =
    percentile <= 25 ? 'text-green-600' :
    percentile <= 50 ? 'text-blue-600' :
    percentile <= 75 ? 'text-yellow-600' : 'text-red-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          How You Stack Up
        </h3>
        <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
          {data.competitors.length} Competitors
        </span>
      </div>

      {/* Position Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
        <p className="text-sm text-gray-600 mb-1">Your Position</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${positionColor}`}>
            #{data.position.split(' ')[0]}
          </p>
          <p className="text-sm text-gray-500">of {data.position.split(' ')[2]}</p>
        </div>
        <p className="text-sm text-gray-700 mt-2 font-medium">{data.message}</p>
      </div>

      {/* Comparison Chart */}
      <div className="space-y-3 mb-6">
        {data.competitors.map((comp, idx) => {
          const isBetter = comp.vai < data.prospect.vai;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-32 text-sm text-gray-600">
                {idx === 0 ? (
                  <span className="flex items-center gap-1">
                    🏆 <span className="font-medium">Leader</span>
                  </span>
                ) : (
                  `Competitor ${idx + 1}`
                )}
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${comp.vai}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className={`h-full ${
                      isBetter
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                  />
                </div>
              </div>
              <div className="w-16 text-right font-mono text-sm font-semibold text-gray-900">
                {comp.vai.toFixed(1)}%
              </div>
            </motion.div>
          );
        })}

        {/* Your Score - Highlighted */}
        <div className="flex items-center gap-4 pt-3 border-t-2 border-gray-300">
          <div className="w-32 text-sm font-semibold text-blue-600 flex items-center gap-1">
            <span>✓</span>
            <span>You</span>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden ring-2 ring-blue-500 ring-offset-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.prospect.vai}%` }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </div>
          </div>
          <div className="w-16 text-right font-mono font-bold text-blue-600 text-base">
            {data.prospect.vai.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">GEO</p>
          <p className="text-sm font-semibold text-gray-900">{data.prospect.geo.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">AEO</p>
          <p className="text-sm font-semibold text-gray-900">{data.prospect.aeo.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">SEO</p>
          <p className="text-sm font-semibold text-gray-900">{data.prospect.seo.toFixed(1)}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700 mb-2 font-medium">
          See detailed competitor analysis in PRO
        </p>
        <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
          Upgrade to PRO →
        </button>
      </div>
    </motion.div>
  );
}

