'use client';

import React, { useState, useEffect } from 'react';

interface QAIStrategicTerminalProps {
  dealerId: string;
  targetSegment?: string;
  localCompetitorAvg?: number;
}

interface QAIData {
  qai_star_score: number;
  authority_velocity: number;
  oci_value: number;
  piqr_score: number;
  aemd_score: number;
  fs_capture_share: number;
  aio_citation_share: number;
  vdp_conversion_oracle: number;
  segment_performance: Array<{
    segment: string;
    qai_score: number;
    dynamic_weight: number;
    defensive_weight: number;
    competitive_threat: boolean;
  }>;
  prescriptive_actions: Array<{
    rank: number;
    action: string;
    trigger: string;
    estimated_net_profit_gain: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    vdp_context: string;
  }>;
  critical_warnings: Array<{
    type: 'hrp_breach' | 'piqr_critical' | 'schema_mismatch';
    severity: 'critical' | 'high' | 'medium';
    message: string;
    action: string;
  }>;
}

export default function QAIStrategicTerminal({ 
  dealerId, 
  targetSegment = "Used Trucks",
  localCompetitorAvg = 65.0 
}: QAIStrategicTerminalProps) {
  const [qaiData, setQaiData] = useState<QAIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQAIData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await fetch(`/api/qai/dashboard?dealerId=${dealerId}&targetSegment=${targetSegment}&localCompetitorAvg=${localCompetitorAvg}`);
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        const apiData = result.data;
        
        // Transform API data to component format
        const transformedData: QAIData = {
          qai_star_score: apiData.qai_star_score,
          authority_velocity: apiData.authority_velocity,
          oci_value: apiData.oci_value,
          piqr_score: apiData.piqr_score,
          aemd_score: apiData.aemd_score,
          fs_capture_share: apiData.fs_capture_share,
          aio_citation_share: apiData.aio_citation_share,
          vdp_conversion_oracle: apiData.vdp_conversion_oracle,
          segment_performance: apiData.segment_performance,
          prescriptive_actions: apiData.prescriptive_actions,
          critical_warnings: apiData.critical_warnings
        };
        
        setQaiData(transformedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load QAI data');
        setLoading(false);
      }
    };

    fetchQAIData();
  }, [dealerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !qaiData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-red-600">⚠️</div>
          <span className="text-red-800">{error || 'Failed to load QAI data'}</span>
        </div>
      </div>
    );
  }

  const getQAIStatus = (score: number) => {
    if (score >= 86) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 66) return { status: 'good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'needs_improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const qaiStatus = getQAIStatus(qaiData.qai_star_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          QAI* Strategic Intelligence Terminal
        </h1>
        <p className="text-gray-600 text-lg">
          Quantum Authority Index Dashboard - {targetSegment} Segment Analysis
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          Dealer ID: {dealerId} | Competitor Benchmark: {localCompetitorAvg}
        </div>
      </div>

      {/* Critical Warning System */}
      {qaiData.critical_warnings.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 text-red-600">🚨</div>
            <h3 className="text-lg font-bold text-red-800">CRITICAL WARNING SYSTEM</h3>
          </div>
          {qaiData.critical_warnings.map((warning, index) => (
            <div key={index} className="ml-8">
              <div className="font-semibold text-red-800">{warning.message}</div>
              <div className="text-red-700 mt-1">
                <strong>Action Required:</strong> {warning.action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Executive Scoreboard (QAI Commander View) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* QAI* Score */}
        <div className="bg-white border-2 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">QAI* Score</h3>
            <div className="w-6 h-6 text-gray-400">🎯</div>
          </div>
          <div className={`text-4xl font-bold mb-2 ${qaiStatus.color}`}>
            {qaiData.qai_star_score}
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${qaiStatus.bg} ${qaiStatus.color}`}>
            {qaiStatus.status.toUpperCase().replace('_', ' ')}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            vs Competitor: {localCompetitorAvg} ({qaiData.qai_star_score - localCompetitorAvg > 0 ? '+' : ''}{qaiData.qai_star_score - localCompetitorAvg} pts)
          </div>
        </div>

        {/* Authority Velocity */}
        <div className="bg-white border-2 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Authority Velocity</h3>
            <div className="w-6 h-6 text-green-600">
              {qaiData.authority_velocity > 0 ? '📈' : '📉'}
            </div>
          </div>
          <div className={`text-3xl font-bold mb-2 ${qaiData.authority_velocity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {qaiData.authority_velocity > 0 ? '+' : ''}{qaiData.authority_velocity}%
          </div>
          <div className="text-sm text-gray-500">7-Day Trend</div>
          <div className="mt-2 text-xs text-gray-500">
            {qaiData.authority_velocity < 0 ? 'Momentum: Requires immediate ASR review' : 'Momentum: Optimization efforts gaining ground'}
          </div>
        </div>

        {/* OCI Value */}
        <div className="bg-white border-2 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">OCI Value</h3>
            <div className="w-6 h-6 text-gray-400">💰</div>
          </div>
          <div className={`text-3xl font-bold mb-2 ${qaiData.oci_value > 5000 ? 'text-red-600' : 'text-yellow-600'}`}>
            ${qaiData.oci_value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Monthly Loss</div>
          <div className="mt-2 text-xs text-gray-500">
            Financial Risk: {qaiData.oci_value > 5000 ? 'HIGH - Prioritize ASR actions' : 'MODERATE - Monitor closely'}
          </div>
        </div>

        {/* PIQR Score */}
        <div className="bg-white border-2 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">PIQR Score</h3>
            <div className="w-6 h-6 text-gray-400">🛡️</div>
          </div>
          <div className={`text-3xl font-bold mb-2 ${qaiData.piqr_score > 1.5 ? 'text-red-600' : qaiData.piqr_score > 1.2 ? 'text-yellow-600' : 'text-green-600'}`}>
            {qaiData.piqr_score}
          </div>
          <div className="text-sm text-gray-500">Platform Integrity</div>
          <div className="mt-2 text-xs text-gray-500">
            {qaiData.piqr_score > 1.5 ? 'CRITICAL: High VDP risk' : qaiData.piqr_score > 1.2 ? 'WARNING: Elevated risk' : 'GOOD: Low risk'}
          </div>
        </div>
      </div>

      {/* AEMD Breakdown and Optimization */}
      <div className="bg-white border rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6">🎯</span>
          Answer Engine Market Dominance (AEMD) Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{qaiData.aemd_score}</div>
            <div className="text-sm text-gray-600">AEMD Score</div>
            <div className="text-xs text-gray-500 mt-1">
              Gap: {qaiData.aemd_score - 65.0} pts vs Competitor
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{qaiData.fs_capture_share}%</div>
            <div className="text-sm text-gray-600">FS Capture Share</div>
            <div className="text-xs text-gray-500 mt-1">
              Target: Implement Table Schema
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{qaiData.aio_citation_share}%</div>
            <div className="text-sm text-gray-600">AIO Citation Share</div>
            <div className="text-xs text-gray-500 mt-1">
              Target: Inject α_T Trust Signals
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{qaiData.vdp_conversion_oracle}%</div>
            <div className="text-sm text-gray-600">VDP Conversion Oracle</div>
            <div className="text-xs text-gray-500 mt-1">
              Benchmark: 25% (See ASR Terminal)
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Heatmap (Segment Performance) */}
      <div className="bg-white border rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6">📊</span>
          Segment Performance Heatmap
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {qaiData.segment_performance.map((segment, index) => {
            const segmentStatus = getQAIStatus(segment.qai_score);
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 relative ${
                  segment.competitive_threat ? 'border-red-400' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: segmentStatus.color.replace('text-', 'bg-').replace('-600', '-100'),
                  opacity: Math.min(segment.dynamic_weight / 2, 1)
                }}
              >
                <div className="font-semibold text-gray-800">{segment.segment}</div>
                <div className="text-sm text-gray-700">QAI: {segment.qai_score}</div>
                <div className="text-sm text-gray-700">Weight: {segment.dynamic_weight.toFixed(1)}x</div>
                {segment.competitive_threat && (
                  <div className="absolute top-1 right-1">
                    <div className="w-4 h-4 text-red-600">⚠️</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prescriptive Action Queue (ASR Terminal) */}
      <div className="bg-white border rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6">⚡</span>
          Prescriptive Action Queue (ASR Terminal)
        </h3>
        <div className="space-y-4">
          {qaiData.prescriptive_actions.map((action) => (
            <div key={action.rank} className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    #{action.rank}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    action.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {action.priority.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{action.action}</h4>
                <p className="text-sm text-gray-600 mt-1">{action.vdp_context}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Trigger:</strong> {action.trigger}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  +${action.estimated_net_profit_gain.toLocaleString()}
                </div>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Execute Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VDP Quality Standards */}
      <div className="bg-white border rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6">📋</span>
          VDP Quality Standards Compliance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Photos (General)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>✅ Minimum: 5 Photos</div>
              <div>🎯 Optimal: 20-30 Photos</div>
              <div>⚠️ Max: 60 Photos (Dilution Warning)</div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Critical Data (Schema)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>✅ VIN, Price, Mileage Present</div>
              <div>🎯 Full schema.org/Offer markup</div>
              <div>⚠️ Price Mismatch = Critical Penalty</div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Photo Angle (VLA)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>✅ First image not placeholder</div>
              <div>🎯 45° front-to-side angle</div>
              <div>⚠️ Rear angle/Stock photo penalty</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
