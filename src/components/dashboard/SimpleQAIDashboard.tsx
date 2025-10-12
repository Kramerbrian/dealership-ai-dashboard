'use client';

import React from 'react';

interface SimpleQAIDashboardProps {
  dealerId: string;
}

export default function SimpleQAIDashboard({ dealerId }: SimpleQAIDashboardProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        QAI* Strategic Intelligence Terminal
      </h1>
      <p className="text-gray-600 mb-8">
        Quantum Authority Index Dashboard - Real-time AI visibility analytics for automotive dealerships
      </p>

      {/* Executive Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">QAI* Score</h3>
            <div className="w-4 h-4 text-gray-400">🎯</div>
          </div>
          <div className="text-2xl font-bold mb-2 text-orange-500">
            78.5
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            GOOD
          </span>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Authority Velocity</h3>
            <div className="w-4 h-4 text-green-600">📈</div>
          </div>
          <div className="text-2xl font-bold mb-2 text-green-600">
            +2.5%
          </div>
          <p className="text-xs text-gray-500">7-day trend</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">OCI Value</h3>
            <div className="w-4 h-4 text-gray-400">💰</div>
          </div>
          <div className="text-2xl font-bold mb-2 text-red-500">
            $12,500
          </div>
          <p className="text-xs text-gray-500">Monthly loss</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Top Risk</h3>
            <div className="w-4 h-4 text-gray-400">🛡️</div>
          </div>
          <div className="text-lg font-bold mb-2">
            Content Duplication
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            HIGH
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
          <div className="p-4 rounded-lg border-2 relative bg-green-500" style={{ opacity: 0.9 }}>
            <div className="text-white font-semibold">Used Trucks</div>
            <div className="text-white text-sm">QAI: 78.5</div>
            <div className="text-white text-sm">AEMD: 65.2</div>
          </div>
          <div className="p-4 rounded-lg border-2 relative bg-green-500" style={{ opacity: 1.0, borderColor: '#FF4444' }}>
            <div className="text-white font-semibold">New EVs</div>
            <div className="text-white text-sm">QAI: 82.3</div>
            <div className="text-white text-sm">AEMD: 72.1</div>
            <div className="absolute top-1 right-1">
              <div className="w-4 h-4 text-red-600">⚠️</div>
            </div>
          </div>
          <div className="p-4 rounded-lg border-2 relative bg-orange-500" style={{ opacity: 0.6 }}>
            <div className="text-white font-semibold">Used Luxury Sedans</div>
            <div className="text-white text-sm">QAI: 65.8</div>
            <div className="text-white text-sm">AEMD: 58.4</div>
          </div>
          <div className="p-4 rounded-lg border-2 relative bg-orange-500" style={{ opacity: 0.75, borderColor: '#FF4444' }}>
            <div className="text-white font-semibold">Compact SUVs</div>
            <div className="text-white text-sm">QAI: 71.2</div>
            <div className="text-white text-sm">AEMD: 62.7</div>
            <div className="absolute top-1 right-1">
              <div className="w-4 h-4 text-red-600">⚠️</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-500">
          <span>High Risk: 1</span>
          <span>Competitive Threats: 2</span>
        </div>
      </div>

      {/* Prescriptive Action Queue */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 text-gray-600">⚡</div>
          <h3 className="text-lg font-semibold">Prescriptive Action Queue</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            $6,850 Total Gain
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  #1
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  HIGH
                </span>
                <span className="text-sm text-gray-500">7 days</span>
              </div>
              <h4 className="font-semibold">Rewrite VDP Text to VDP-TOP Protocol</h4>
              <p className="text-sm text-gray-500">VIN #1234 - 2022 Honda Accord</p>
              <p className="text-xs text-gray-500">Trigger: PIQR=1.8 (Deceptive Pricing)</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                +$3,200
              </div>
              <div className="text-sm text-gray-500">
                ROI: 21.3x
              </div>
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Execute
              </button>
            </div>
          </div>
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
              68.2
            </div>
            <div className="text-sm text-gray-500">
              Current: 62.5
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              +5.7 pts
            </div>
            <div className="text-sm text-gray-500">
              Confidence: 85%
            </div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: '68.2%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
