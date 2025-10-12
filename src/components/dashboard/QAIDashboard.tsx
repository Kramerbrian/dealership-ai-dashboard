'use client';

import React, { useState, useEffect } from 'react';

interface QAIDashboardProps {
  dealerId: string;
}

interface DashboardData {
  executive_scoreboard: {
    qai_score: {
      value: number;
      status: string;
      color: string;
      label: string;
    };
    authority_velocity: {
      value: string;
      trend: string;
      label: string;
      color: string;
    };
    oci_value: {
      value: string;
      label: string;
      color: string;
    };
    top_risks: Array<{
      factor: string;
      value: number;
      severity: string;
    }>;
  };
  segment_heatmap: {
    heatmap_data: Array<{
      segment: string;
      qai_score: number;
      color: string;
      intensity: number;
      competitive_threat: boolean;
      aemd_score: number;
      vdp_conversion: number;
    }>;
    high_risk_segments: number;
    competitive_threats: number;
  };
  prescriptive_action_queue: {
    action_queue: Array<{
      rank: number;
      action: string;
      vdp_context: string;
      trigger: string;
      estimated_net_profit_gain: number;
      priority: string;
      timeline: string;
      cost: number;
      roi_multiple: number;
    }>;
    total_estimated_gain: number;
    average_roi: number;
  };
  critical_warnings: {
    warnings: Array<{
      type: string;
      severity: string;
      title: string;
      message: string;
      action: string;
      color: string;
    }>;
    critical_count: number;
  };
  forecast: {
    current_aemd: number;
    forecast_aemd: number;
    projected_change: number;
    confidence: number;
    trend_direction: string;
  };
}

export default function QAIDashboard({ dealerId }: QAIDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call - replace with actual API endpoint
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Use static mock data for now
        const mockData: DashboardData = {
          executive_scoreboard: {
            qai_score: {
              value: 78.5,
              status: 'good',
              color: '#FFA500',
              label: 'QAI* Score'
            },
            authority_velocity: {
              value: '+2.5%',
              trend: 'up',
              label: 'Authority Velocity (7-Day)',
              color: '#00AA00'
            },
            oci_value: {
              value: '$12,500',
              label: 'Opportunity Cost of Inaction',
              color: '#FF4444'
            },
            top_risks: [
              { factor: 'Content Duplication', value: 1.8, severity: 'high' },
              { factor: 'Schema Latency', value: 1.1, severity: 'medium' },
              { factor: 'Image Quality', value: 0.9, severity: 'low' }
            ]
          },
          segment_heatmap: {
            heatmap_data: [
              { segment: 'Used Trucks', qai_score: 78.5, color: '#00AA00', intensity: 0.9, competitive_threat: false, aemd_score: 65.2, vdp_conversion: 0.18 },
              { segment: 'New EVs', qai_score: 82.3, color: '#00AA00', intensity: 1.0, competitive_threat: true, aemd_score: 72.1, vdp_conversion: 0.22 },
              { segment: 'Used Luxury Sedans', qai_score: 65.8, color: '#FFA500', intensity: 0.6, competitive_threat: false, aemd_score: 58.4, vdp_conversion: 0.12 },
              { segment: 'Compact SUVs', qai_score: 71.2, color: '#FFA500', intensity: 0.75, competitive_threat: true, aemd_score: 62.7, vdp_conversion: 0.15 }
            ],
            high_risk_segments: 1,
            competitive_threats: 2
          },
          prescriptive_action_queue: {
            action_queue: [
              {
                rank: 1,
                action: 'Rewrite VDP Text to VDP-TOP Protocol',
                vdp_context: 'VIN #1234 - 2022 Honda Accord',
                trigger: 'PIQR=1.8 (Deceptive Pricing)',
                estimated_net_profit_gain: 3200,
                priority: 'high',
                timeline: '7 days',
                cost: 150,
                roi_multiple: 21.3
              },
              {
                rank: 2,
                action: 'Add 2 Photos (Odometer, Interior)',
                vdp_context: 'VDP #5678 - 2021 Ford F-150',
                trigger: 'Low P_VDP (10%)',
                estimated_net_profit_gain: 2150,
                priority: 'high',
                timeline: '3 days',
                cost: 25,
                roi_multiple: 86.0
              },
              {
                rank: 3,
                action: 'Launch Review Generation Campaign',
                vdp_context: 'Service Department',
                trigger: 'Trust Signal Decay (λ_T = -5.0%)',
                estimated_net_profit_gain: 1500,
                priority: 'medium',
                timeline: '14 days',
                cost: 200,
                roi_multiple: 7.5
              }
            ],
            total_estimated_gain: 6850,
            average_roi: 38.3
          },
          critical_warnings: {
            warnings: [
              {
                type: 'high_piqr_risk',
                severity: 'high',
                title: 'HIGH PIQR RISK',
                message: 'PIQR = 1.8. Platform integrity concerns detected.',
                action: 'Review VDP quality and compliance immediately.',
                color: '#FFA500'
              }
            ],
            critical_count: 0
          },
          forecast: {
            current_aemd: 62.5,
            forecast_aemd: 68.2,
            projected_change: 5.7,
            confidence: 0.85,
            trend_direction: 'up'
          }
        };
        
        setDashboardData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    fetchDashboardData();
    
    return () => clearTimeout(timeoutId);
  }, [dealerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Critical Warnings */}
      {dashboardData.critical_warnings.warnings.length > 0 && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-red-600">⚠️</div>
            <div>
              <strong className="text-red-800">{dashboardData.critical_warnings.warnings[0].title}</strong>
              <br />
              <span className="text-red-700">{dashboardData.critical_warnings.warnings[0].message}</span>
              <br />
              <strong className="text-red-800">Action:</strong> <span className="text-red-700">{dashboardData.critical_warnings.warnings[0].action}</span>
            </div>
          </div>
        </div>
      )}

      {/* Executive Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">QAI* Score</h3>
            <div className="w-4 h-4 text-gray-400">🎯</div>
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: dashboardData.executive_scoreboard.qai_score.color }}>
            {dashboardData.executive_scoreboard.qai_score.value}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            dashboardData.executive_scoreboard.qai_score.status === 'excellent' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {dashboardData.executive_scoreboard.qai_score.status.toUpperCase()}
          </span>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Authority Velocity</h3>
            <div className="w-4 h-4 text-green-600">
              {dashboardData.executive_scoreboard.authority_velocity.trend === 'up' ? '📈' : '📉'}
            </div>
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: dashboardData.executive_scoreboard.authority_velocity.color }}>
            {dashboardData.executive_scoreboard.authority_velocity.value}
          </div>
          <p className="text-xs text-gray-500">7-day trend</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">OCI Value</h3>
            <div className="w-4 h-4 text-gray-400">💰</div>
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: dashboardData.executive_scoreboard.oci_value.color }}>
            {dashboardData.executive_scoreboard.oci_value.value}
          </div>
          <p className="text-xs text-gray-500">Monthly loss</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Top Risk</h3>
            <div className="w-4 h-4 text-gray-400">🛡️</div>
          </div>
          <div className="text-lg font-bold mb-2">
            {dashboardData.executive_scoreboard.top_risks[0]?.factor}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            dashboardData.executive_scoreboard.top_risks[0]?.severity === 'high' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {dashboardData.executive_scoreboard.top_risks[0]?.severity.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Segment Heatmap */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 text-gray-600">📊</div>
          <h3 className="text-lg font-semibold">Segment Performance Heatmap</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboardData.segment_heatmap.heatmap_data.map((segment) => (
            <div
              key={segment.segment}
              className="p-4 rounded-lg border-2 relative"
              style={{
                backgroundColor: segment.color,
                opacity: segment.intensity,
                borderColor: segment.competitive_threat ? '#FF4444' : 'transparent'
              }}
            >
              <div className="text-white font-semibold">{segment.segment}</div>
              <div className="text-white text-sm">QAI: {segment.qai_score}</div>
              <div className="text-white text-sm">AEMD: {segment.aemd_score}</div>
              {segment.competitive_threat && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 text-red-600">⚠️</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-500">
          <span>High Risk: {dashboardData.segment_heatmap.high_risk_segments}</span>
          <span>Competitive Threats: {dashboardData.segment_heatmap.competitive_threats}</span>
        </div>
      </div>

      {/* Prescriptive Action Queue */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 text-gray-600">⚡</div>
          <h3 className="text-lg font-semibold">Prescriptive Action Queue</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ${dashboardData.prescriptive_action_queue.total_estimated_gain.toLocaleString()} Total Gain
          </span>
        </div>
        <div className="space-y-4">
          {dashboardData.prescriptive_action_queue.action_queue.map((action) => (
            <div key={action.rank} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    #{action.rank}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    action.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {action.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{action.timeline}</span>
                </div>
                <h4 className="font-semibold">{action.action}</h4>
                <p className="text-sm text-gray-500">{action.vdp_context}</p>
                <p className="text-xs text-gray-500">Trigger: {action.trigger}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  +${action.estimated_net_profit_gain.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  ROI: {action.roi_multiple}x
                </div>
                <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Execute
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Forecast */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 text-gray-600">👁️</div>
          <h3 className="text-lg font-semibold">30-Day AEMD Forecast</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {dashboardData.forecast.forecast_aemd.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">
              Current: {dashboardData.forecast.current_aemd.toFixed(1)}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${dashboardData.forecast.projected_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardData.forecast.projected_change > 0 ? '+' : ''}{dashboardData.forecast.projected_change.toFixed(1)} pts
            </div>
            <div className="text-sm text-gray-500">
              Confidence: {(dashboardData.forecast.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${dashboardData.forecast.forecast_aemd}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
