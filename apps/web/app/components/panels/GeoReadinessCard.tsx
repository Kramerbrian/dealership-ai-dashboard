'use client';
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Brain, 
  Network, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';

interface GeoReadinessData {
  latest: {
    id: string;
    computedAt: string;
    geoReadinessScore: number;
    components: {
      geoChecklist: number;
      aioExposure: number;
      topicalDepth: number;
      kgPresent: boolean;
      kgCompleteness: number;
      mentionVelocity: number;
      extractability: number;
    };
    stability: {
      score: number;
      status: 'stable' | 'unstable';
    };
    confidence: number;
    source: {
      provider: string;
      title: string;
      url: string;
      fetchedAt: string;
    };
  };
  composite: {
    scoreType: string;
    scoreValue: number;
    components: any;
    confidence: number;
    status: string;
    computedAt: string;
  } | null;
  history: Array<{
    id: string;
    computedAt: string;
    geoReadinessScore: number;
    geoChecklistScore: number;
    stabilityScore: number;
    confidence: number;
  }> | null;
}

interface GeoReadinessCardProps {
  tenantId: string;
  className?: string;
}

export default function GeoReadinessCard({ tenantId, className = '' }: GeoReadinessCardProps) {
  const [data, setData] = useState<GeoReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeoSignals = async () => {
      try {
        const response = await fetch(`/api/tenants/${tenantId}/geo-signals/latest?includeHistory=true&windowWeeks=8`);
        const result = await response.json();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
      } catch (err) {
        setError('Failed to fetch GEO readiness data');
        console.error('Error fetching GEO signals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoSignals();
  }, [tenantId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getStabilityIcon = (status: string) => {
    return status === 'stable' ? (
      <CheckCircle className="h-4 w-4 text-emerald-400" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-amber-400" />
    );
  };

  if (loading) {
    return (
      <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-slate-800 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-white mb-1">GEO Readiness</h3>
          <p className="text-slate-400 text-sm">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const { latest, history } = data;
  const components = latest.components;

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">GEO Readiness</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStabilityIcon(latest.stability.status)}
          <span className="text-xs text-slate-400">
            {latest.stability.status === 'stable' ? 'Stable' : 'Unstable'}
          </span>
        </div>
      </div>

      {/* Main Score */}
      <div className="mb-6">
        <div className={`${getScoreBg(latest.geoReadinessScore)} border rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">Overall Score</div>
              <div className={`text-3xl font-bold ${getScoreColor(latest.geoReadinessScore)}`}>
                {latest.geoReadinessScore}
              </div>
              <div className="text-xs text-slate-500">out of 100</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Confidence</div>
              <div className="text-sm font-medium text-slate-300">
                {(latest.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-slate-400">AIO Exposure</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {Number(components.aioExposure).toFixed(0)}%
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Network className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-slate-400">KG Presence</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {components.kgPresent ? `${components.kgCompleteness}%` : 'None'}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs text-slate-400">Mention Velocity</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {components.mentionVelocity}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-slate-400">Checklist</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {components.geoChecklist}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {history && history.length > 1 && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">8-Week Trend</div>
          <div className="h-16 bg-slate-800/30 rounded-lg p-2">
            <div className="flex items-end justify-between h-full">
              {history.slice(0, 8).map((point, index) => {
                const height = (point.geoReadinessScore / 100) * 100;
                return (
                  <div
                    key={point.id}
                    className="bg-indigo-500 rounded-sm"
                    style={{
                      width: '8px',
                      height: `${height}%`,
                      opacity: 0.7,
                    }}
                    title={`${point.geoReadinessScore}% (${new Date(point.computedAt).toLocaleDateString()})`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Source Info */}
      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Source: {latest.source.provider}
          </div>
          <a
            href={latest.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View Source
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Updated: {new Date(latest.computedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Tooltip Info */}
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-400">
            <div className="font-medium text-slate-300 mb-1">Why this matters:</div>
            <div>
              GEO readiness measures your content's ability to appear in AI Overviews and 
              knowledge panels. Higher scores indicate better structured, more authoritative content 
              that search engines can easily understand and feature.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
