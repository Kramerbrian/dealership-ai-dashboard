'use client';

import { X, Cog } from 'lucide-react';

export default function AiriExplainer({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-black/10">
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <Cog className="h-5 w-5" />
            <h3 className="font-semibold">AI Replacement Index</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pb-4 text-sm leading-6 pt-4">
          <p className="mb-3">
            Not all visibility equals traffic. AIRI estimates how much potential
            traffic AI answers absorbed.
          </p>
          <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
            <p className="opacity-80">Formula:</p>
            <p className="font-semibold">
              AI presence × (CTR baseline − CTR actual)
            </p>
          </div>
          <p className="mt-2">
            <span className="font-semibold">Action:</span> Improve trust signals
            and structured answers so AI cites your site and brand — not just
            summarizes competitors.
          </p>
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs">
            <p className="font-semibold mb-1">What This Means:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="text-green-600 dark:text-green-400">
                  AIRI ↓ Low
                </span>{' '}
                = AI isn't displacing much traffic (good)
              </li>
              <li>
                <span className="text-yellow-600 dark:text-yellow-400">
                  AIRI → Medium
                </span>{' '}
                = Some traffic displacement, room for improvement
              </li>
              <li>
                <span className="text-red-600 dark:text-red-400">
                  AIRI ↑ High
                </span>{' '}
                = Significant traffic lost to AI answers (action needed)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
