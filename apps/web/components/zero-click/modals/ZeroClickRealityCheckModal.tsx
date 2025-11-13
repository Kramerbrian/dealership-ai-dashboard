/**
 * Zero-Click Reality Check Modal
 * "Every query logged. Every click counted."
 */

'use client';

import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ZeroClickRealityCheckModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              🔍 Zero-Click Reality Check
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
              Every query logged. Every click counted.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What We Track</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>Search Console:</strong> Every impression and click from Google search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>AI Probes:</strong> Real-time checks across ChatGPT, Claude, Gemini, Perplexity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>GBP Actions:</strong> Calls, directions, messages, bookings that happened on-SERP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>GA4 Events:</strong> Site search and result interactions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
              <p className="text-sm text-gray-600 mb-3">
                Zero-click isn't a loss—it's a shift. When customers find you through AI answers or Google Maps,
                they may not click through to your website, but that doesn't mean they didn't engage.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1">AI Visibility</div>
                  <div className="text-blue-700">Shown in AI answers across platforms</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1">GBP Actions</div>
                  <div className="text-green-700">Calls, directions saved on-SERP</div>
                </div>
              </div>
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
                  // Navigate to detailed analytics
                  window.location.href = '/intelligence?tab=zero-click';
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Detailed Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

