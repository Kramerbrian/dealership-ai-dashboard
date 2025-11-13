/**
 * AI Replacement Explained Modal
 * "Not all visibility equals traffic. This shows the delta."
 */

'use client';

import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AIReplacementExplainedModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              ⚙️ AI Replacement Index Explained
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
              Not all visibility equals traffic. This shows the delta.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">What is AIRI?</h3>
              <p className="text-sm text-yellow-800 mb-3">
                The AI Replacement Index measures how much potential traffic is being displaced by AI answers.
                Higher AIRI = more searches that AI handled instead of sending users to your site.
              </p>
              <div className="text-xs text-yellow-700 font-mono">
                AIRI = AI Presence Rate × (CTR Baseline - CTR Actual)
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Understanding the Impact</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⚠</span>
                    <div>
                      <strong>High AIRI (0.2+)</strong>: AI answers are absorbing significant traffic
                      <br />
                      <span className="text-gray-500">Action: Focus on on-SERP conversion (GBP, maps)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">ℹ</span>
                    <div>
                      <strong>Medium AIRI (0.1-0.2)</strong>: Some displacement, but manageable
                      <br />
                      <span className="text-gray-500">Action: Monitor trends, optimize AI visibility</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Low AIRI (&lt;0.1)</strong>: Minimal displacement
                      <br />
                      <span className="text-gray-500">Action: Maintain current strategy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How We Calculate</h3>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>Measure AI presence rate (how often AI answers appear)</li>
                <li>Compare actual CTR vs baseline CTR for your industry</li>
                <li>Multiply: Presence × CTR gap = Replacement Index</li>
                <li>Higher score = more traffic replaced by AI</li>
              </ol>
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
                  window.location.href = '/intelligence?tab=zero-click';
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Identify Lost Queries
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

