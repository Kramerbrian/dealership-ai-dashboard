/**
 * Trusted by AI Modal
 * Shows Algorithmic Trust Index trend
 */

'use client';

import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TrustedByAIModal({ open, onClose }: Props) {
  if (!open) return null;

  // Mock ATI trend data
  const atiData = [
    { date: 'Week 1', ati: 72 },
    { date: 'Week 2', ati: 75 },
    { date: 'Week 3', ati: 78 },
    { date: 'Week 4', ati: 82 },
    { date: 'Week 5', ati: 85 },
    { date: 'Week 6', ati: 87 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              📈 Trusted by AI
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">
              Your Algorithmic Trust Index trend. The higher this goes, the more likely AI includes you by name.
            </p>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-mono font-bold text-blue-700 mb-2">
                87
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Current Algorithmic Trust Index
              </div>
              <div className="text-xs text-blue-500 mt-1">
                +15 points in last 6 weeks
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={atiData}>
                  <defs>
                    <linearGradient id="atiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
                  <Area 
                    type="monotone" 
                    dataKey="ati" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#atiGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Trust Signals</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-600">E-E-A-T Score</div>
                  <div className="font-semibold text-gray-900">92/100</div>
                </div>
                <div>
                  <div className="text-gray-600">Review Velocity</div>
                  <div className="font-semibold text-gray-900">+18%</div>
                </div>
                <div>
                  <div className="text-gray-600">Citation Consistency</div>
                  <div className="font-semibold text-gray-900">98%</div>
                </div>
                <div>
                  <div className="text-gray-600">Schema Coverage</div>
                  <div className="font-semibold text-gray-900">85%</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Why it matters:</strong> Higher ATI = AI assistants are more likely to mention your dealership
              by name in their answers, increasing brand visibility without requiring clicks.
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = '/intelligence?tab=trust';
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Learn Why AI Includes You
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

