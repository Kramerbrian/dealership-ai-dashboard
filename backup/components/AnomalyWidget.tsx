'use client';
import { detectAnomalies, getTopAnomalies } from '@/lib/anomalyDetector';

export default function AnomalyWidget({ 
  series, 
  showWhy = true,
  limit = 5 
}: { 
  series: { label: string; values: number[] }[];
  showWhy?: boolean;
  limit?: number;
}) {
  const anomalies = getTopAnomalies(series, limit);
  
  if (!anomalies.length) return null;

  const why = (a: any) => {
    window.dispatchEvent(new CustomEvent('dealergpt:why', { detail: a }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-800 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-800 bg-orange-50 border-orange-200';
      default: return 'text-yellow-800 bg-yellow-50 border-yellow-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating': return '↗️';
      case 'decelerating': return '↘️';
      default: return '→';
    }
  };

  return (
    <div className="rounded-2xl border border-yellow-400 bg-yellow-50 p-4 shadow">
      <div className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
        <span>🚨</span>
        Recent Anomalies
        <span className="text-xs font-normal text-yellow-600">
          ({anomalies.length} detected)
        </span>
      </div>
      
      <ul className="text-sm text-yellow-800 space-y-2">
        {anomalies.map((a, i) => (
          <li key={i} className="flex items-center justify-between p-2 rounded bg-white/50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{a.metric}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(a.severity)}`}>
                  {a.severity}
                </span>
                <span className="text-xs opacity-70">
                  {getTrendIcon(a.trend)} week {a.week}
                </span>
              </div>
              <div className="text-xs opacity-80 mt-1">
                {a.dir === 'up' ? '↑' : '↓'} {Math.abs(a.delta)}% 
                <span className="ml-2 opacity-60">(score: {a.score.toFixed(1)})</span>
              </div>
            </div>
            {showWhy && (
              <button 
                onClick={() => why(a)} 
                className="text-xs px-3 py-1 rounded bg-yellow-700 text-white hover:bg-yellow-800 transition-colors"
              >
                Why?
              </button>
            )}
          </li>
        ))}
      </ul>
      
      {anomalies.length >= limit && (
        <div className="text-xs text-yellow-600 mt-2 text-center">
          Showing top {limit} anomalies
        </div>
      )}
    </div>
  );
}