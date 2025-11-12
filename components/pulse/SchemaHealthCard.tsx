'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBrandColor } from '@/contexts/BrandColorContext';

interface SchemaHealthData {
  schemaCoverage: number;
  eeatScore: number;
  lastAudit: string;
  status: 'healthy' | 'warning' | 'critical';
  trends: {
    coverage: 'up' | 'down' | 'stable';
    eeat: 'up' | 'down' | 'stable';
  };
  recommendations?: string[];
}

export default function SchemaHealthCard() {
  const { accent, accentSoft } = useBrandColor();
  const [data, setData] = useState<SchemaHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemaHealth();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSchemaHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchSchemaHealth() {
    try {
      const response = await fetch('/api/marketpulse/eeat/score');
      if (!response.ok) throw new Error('Failed to fetch schema health');

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-slate-200">Schema Health</h3>
            <div className="h-2 w-12 bg-slate-700 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded animate-pulse" />
            <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-slate-900/50 border border-red-900/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-lg text-slate-200">Schema Health</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-400">
            {error || 'Unable to load schema health data'}
          </p>
          <button
            onClick={fetchSchemaHealth}
            className="mt-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const statusColor = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  }[data.status];

  const statusIcon = {
    healthy: '✓',
    warning: '⚠',
    critical: '✗',
  }[data.status];

  const trendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        className="bg-slate-900/50 border backdrop-blur-sm hover:bg-slate-900/60 transition-all duration-300"
        style={{ borderColor: `${accent}33` }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-slate-200 flex items-center gap-2">
              <span className={statusColor}>{statusIcon}</span>
              Schema Health
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchSchemaHealth}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh"
            >
              ↻
            </motion.button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Schema Coverage */}
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: accent }}
                >
                  {data.schemaCoverage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">
                  {trendIcon(data.trends.coverage)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Schema Coverage</p>
            </div>

            {/* E-E-A-T Score */}
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: accent }}
                >
                  {data.eeatScore.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">
                  {trendIcon(data.trends.eeat)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">E-E-A-T Score</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Schema Coverage</span>
                <span className="text-xs text-slate-500">{data.schemaCoverage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.schemaCoverage}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${accentSoft}, ${accent})`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">E-E-A-T Score</span>
                <span className="text-xs text-slate-500">{data.eeatScore.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.eeatScore}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${accentSoft}, ${accent})`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Last Audit */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Last Audit: {new Date(data.lastAudit).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-300 mb-2">Recommendations:</p>
              <ul className="space-y-1">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                    <span style={{ color: accent }}>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${statusColor} bg-slate-800/50`}
            >
              {data.status.toUpperCase()}
            </span>
            <a
              href="/docs/schema-health"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              style={{ color: `${accent}80` }}
            >
              View Details →
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
