"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const Sparkline = dynamic(() => import("@/components/visibility/Sparkline"), { ssr: false });

interface PulseTile {
  id: string;
  metric_key: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  insight: string;
  change: string;
  impact: 'low' | 'medium' | 'high';
  current_value: number;
  previous_value: number;
  source: string;
  anomaly_detected: boolean;
  signal_strength: number;
  pulse_frequency: 'hourly' | 'daily' | 'weekly';
}

interface PulseOrbitProps {
  role?: 'gm' | 'marketing' | 'service';
  onTileClick?: (tile: PulseTile) => void;
}

export default function PulseOrbit({ role = 'gm', onTileClick }: PulseOrbitProps) {
  const [tiles, setTiles] = useState<PulseTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pulse/tiles?limit=20', { cache: 'no-store' });
        const json = await res.json();
        if (json.success) {
          setTiles(json.tiles || []);
        }
      } catch (error) {
        console.error('Failed to load tiles:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-refresh based on highest frequency tile
  useEffect(() => {
    if (tiles.length === 0) return;

    const frequencies = tiles.map(t => t.pulse_frequency);
    const hasHourly = frequencies.includes('hourly');
    const hasDaily = frequencies.includes('daily');
    
    const interval = hasHourly ? 3600000 : hasDaily ? 86400000 : 604800000; // 1h, 1d, 1w

    const timer = setInterval(() => {
      fetch('/api/pulse/tiles?limit=20', { cache: 'no-store' })
        .then(r => r.json())
        .then(json => {
          if (json.success) setTiles(json.tiles || []);
        })
        .catch(console.error);
    }, interval);

    return () => clearInterval(timer);
  }, [tiles.length]);

  // Role-based filtering and sorting
  const filteredTiles = useMemo(() => {
    // Filter by role relevance (placeholder - enhance with role-specific logic)
    let filtered = [...tiles];
    
    // Sort by priority (urgency + signal strength)
    filtered.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.signal_strength - a.signal_strength;
    });

    return filtered;
  }, [tiles, role]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'high': return 'border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      default: return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getUrgencyGradient = (urgency: string, unresolved: boolean) => {
    if (!unresolved) return '';
    // Animate border from blue → amber if unresolved >48h
    return urgency === 'critical' || urgency === 'high'
      ? 'animate-pulse border-amber-500/70'
      : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading pulse tiles...</div>
      </div>
    );
  }

  if (filteredTiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">No active pulse tiles</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Orbit Layout: Center KPIs, tiles orbit by urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTiles.map((tile) => {
          const isUnresolved = true; // TODO: Check if resolved_at is null
          const hoursSinceCreation = 0; // TODO: Calculate from created_at
          const needsUrgencyGradient = isUnresolved && hoursSinceCreation > 48;

          return (
            <div
              key={tile.id}
              className={`
                relative rounded-lg border p-4 transition-all duration-300
                ${getUrgencyColor(tile.urgency)}
                ${needsUrgencyGradient ? getUrgencyGradient(tile.urgency, isUnresolved) : ''}
                ${tile.anomaly_detected ? 'ring-2 ring-offset-2 ring-offset-black ring-white/20' : ''}
                hover:scale-105 hover:shadow-lg cursor-pointer
              `}
              onClick={() => onTileClick?.(tile)}
              onMouseEnter={(e) => {
                // Show hover tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute z-50 bg-black/95 text-white text-xs rounded p-2 shadow-xl';
                tooltip.innerHTML = `
                  <div>Fix Next</div>
                  <div>View Source</div>
                  <div>Auto-Generate Schema</div>
                `;
                tooltip.style.top = `${e.currentTarget.offsetTop + e.currentTarget.offsetHeight + 8}px`;
                tooltip.style.left = `${e.currentTarget.offsetLeft}px`;
                document.body.appendChild(tooltip);
                (e.currentTarget as any).tooltip = tooltip;
              }}
              onMouseLeave={(e) => {
                const tooltip = (e.currentTarget as any).tooltip;
                if (tooltip) {
                  document.body.removeChild(tooltip);
                  (e.currentTarget as any).tooltip = null;
                }
              }}
            >
              {/* Pulsing halo for anomalies */}
              {tile.anomaly_detected && (
                <div className="absolute inset-0 rounded-lg animate-pulse bg-white/5" />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{tile.title}</div>
                    <div className="text-xs text-white/60 mt-1">{tile.metric_key}</div>
                  </div>
                  <div className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${tile.urgency === 'critical' ? 'bg-red-500/20 text-red-400' : ''}
                    ${tile.urgency === 'high' ? 'bg-orange-500/20 text-orange-400' : ''}
                    ${tile.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${tile.urgency === 'low' ? 'bg-blue-500/20 text-blue-400' : ''}
                  `}>
                    {tile.urgency}
                  </div>
                </div>

                <div className="text-sm text-white/80 mb-2">{tile.insight}</div>

                <div className="flex items-center gap-4 text-xs text-white/60">
                  <div>
                    <span className="font-medium text-white">{tile.change}</span> change
                  </div>
                  <div>
                    Impact: <span className="font-medium text-white">{tile.impact}</span>
                  </div>
                  <div>
                    Source: <span className="font-medium text-white">{tile.source}</span>
                  </div>
                </div>

                {/* Mini sparkline for trend */}
                <div className="mt-3 h-8">
                  <Sparkline
                    values={[tile.previous_value, tile.current_value]}
                    width={120}
                    height={32}
                    stroke={tile.urgency === 'critical' ? '#EF4444' : '#93C5FD'}
                    fill={tile.urgency === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(147, 197, 253, 0.15)'}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

