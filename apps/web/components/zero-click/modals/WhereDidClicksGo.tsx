'use client';

import { X, Info } from 'lucide-react';

export default function WhereDidClicksGo({
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
            <Info className="h-5 w-5" />
            <h3 className="font-semibold">Where did the clicks go?</h3>
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
            Zero-click = customers saw you, but didn't need to click. AI answers
            or Google Maps handled it.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold">Zero-Click (ZCR)</span> —
              impressions that didn't click.
            </li>
            <li>
              <span className="font-semibold">GBP Save-Rate (ZCCO)</span> —
              calls, directions, messages that happened on-SERP.
            </li>
            <li>
              <span className="font-semibold">Adjusted Zero-Click</span> — ZCR
              minus ZCCO (the real exposure gap).
            </li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
            <p className="font-semibold mb-1">Key Insight:</p>
            <p>
              A zero-click search isn't a loss — it's a shift. dAI tracks
              whether AI or Google answered for you, and whether your brand
              still got the call, direction, or message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
