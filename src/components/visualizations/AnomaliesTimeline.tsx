"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Anomaly {
  signal: string;
  zScore: number;
  note?: string;
}

interface AnomaliesTimelineProps {
  anomalies: Anomaly[];
  regimeState: 'Normal' | 'ShiftDetected' | 'Quarantine';
}

export default function AnomaliesTimeline({ anomalies, regimeState }: AnomaliesTimelineProps) {
  const getSeverity = (zScore: number) => {
    const absZ = Math.abs(zScore);
    if (absZ >= 3) return { level: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: '🔴' };
    if (absZ >= 2.5) return { level: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', icon: '🟠' };
    if (absZ >= 2) return { level: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: '🟡' };
    return { level: 'Low', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: '🔵' };
  };

  const getRegimeInfo = (state: string) => {
    switch (state) {
      case 'Normal':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/50',
          icon: '✅',
          description: 'All signals within expected ranges'
        };
      case 'ShiftDetected':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
          icon: '⚠️',
          description: 'Significant pattern changes detected'
        };
      case 'Quarantine':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/50',
          icon: '🚨',
          description: 'Major anomalies require investigation'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
          icon: 'ℹ️',
          description: 'Status unknown'
        };
    }
  };

  const regimeInfo = getRegimeInfo(regimeState);
  const sortedAnomalies = [...anomalies].sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

  const ZScoreGauge = ({ zScore }: { zScore: number }) => {
    const absZ = Math.abs(zScore);
    const maxZ = 4;
    const percentage = Math.min((absZ / maxZ) * 100, 100);
    const isPositive = zScore > 0;

    return (
      <div className="relative">
        <div className="h-24 w-8 bg-white/10 rounded-full overflow-hidden relative">
          {/* Threshold markers */}
          <div className="absolute w-full h-px bg-white/30 top-[25%]" />
          <div className="absolute w-full h-px bg-white/30 top-[37.5%]" />
          <div className="absolute w-full h-px bg-white/30 top-[50%]" />

          {/* Gauge fill */}
          <div
            className={`absolute bottom-0 w-full transition-all duration-500 ${
              absZ >= 3 ? 'bg-red-500' : absZ >= 2.5 ? 'bg-orange-500' : absZ >= 2 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ height: `${percentage}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <div className="text-xs font-bold text-white">{zScore > 0 ? '+' : ''}{zScore.toFixed(2)}</div>
          <div className="text-xs text-gray-500">σ</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Anomaly Detection & Regime State</h3>

      {/* Regime State Banner */}
      <div className={`p-5 rounded-lg border mb-8 ${regimeInfo.color}`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{regimeInfo.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-bold">Regime State: {regimeState}</h4>
              <Badge className={regimeInfo.color}>{regimeState}</Badge>
            </div>
            <p className="text-sm opacity-90">{regimeInfo.description}</p>
          </div>
          {anomalies.length > 0 && (
            <div className="text-right">
              <div className="text-3xl font-bold">{anomalies.length}</div>
              <div className="text-xs opacity-75">Active anomalies</div>
            </div>
          )}
        </div>
      </div>

      {/* Anomalies List */}
      {anomalies.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
            Detected Anomalies
          </h4>

          {sortedAnomalies.map((anomaly, index) => {
            const severity = getSeverity(anomaly.zScore);
            return (
              <div
                key={index}
                className={`p-5 rounded-lg border ${severity.color} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-4">
                  {/* Z-Score Gauge */}
                  <ZScoreGauge zScore={anomaly.zScore} />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="text-lg font-semibold text-white mb-1">{anomaly.signal}</h5>
                        {anomaly.note && (
                          <p className="text-sm text-gray-300">{anomaly.note}</p>
                        )}
                      </div>
                      <Badge className={severity.color}>
                        {severity.icon} {severity.level}
                      </Badge>
                    </div>

                    {/* Statistical info */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-xs text-gray-400">Z-Score</div>
                        <div className="text-lg font-bold text-white">
                          {anomaly.zScore > 0 ? '+' : ''}{anomaly.zScore.toFixed(2)}σ
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Direction</div>
                        <div className="text-lg font-bold text-white">
                          {anomaly.zScore > 0 ? '↗ Above' : '↘ Below'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Probability</div>
                        <div className="text-lg font-bold text-white">
                          {(100 * (1 - Math.min(Math.abs(anomaly.zScore) / 4, 0.999))).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Severity bar */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <span>Severity</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        Math.abs(anomaly.zScore) >= 3
                          ? 'bg-red-500'
                          : Math.abs(anomaly.zScore) >= 2.5
                          ? 'bg-orange-500'
                          : Math.abs(anomaly.zScore) >= 2
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((Math.abs(anomaly.zScore) / 4) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✨</div>
          <h4 className="text-lg font-semibold text-green-400 mb-2">No Anomalies Detected</h4>
          <p className="text-sm text-gray-400">All signals are operating within normal parameters</p>
        </div>
      )}

      {/* Statistical Context */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Statistical Context</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">Z-Score</div>
            <div className="text-sm font-semibold text-white">Standard Deviations</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center border border-blue-500/30">
            <div className="text-xs text-gray-400 mb-1">|Z| &lt; 2</div>
            <div className="text-sm font-semibold text-blue-400">Normal (95%)</div>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-lg text-center border border-yellow-500/30">
            <div className="text-xs text-gray-400 mb-1">2 ≤ |Z| &lt; 3</div>
            <div className="text-sm font-semibold text-yellow-400">Unusual (5%)</div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-center border border-red-500/30">
            <div className="text-xs text-gray-400 mb-1">|Z| ≥ 3</div>
            <div className="text-sm font-semibold text-red-400">Rare (&lt;0.3%)</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
