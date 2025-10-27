'use client';

import { X, Info } from 'lucide-react';

export default function WhereDidClicksGo({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void 
}) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-black/10">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <h3 className="font-semibold">Where did the clicks go?</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pb-4 text-sm leading-6">
          <p className="mb-3">
            Zero-click = customers saw you, but didn&apos;t need to click. AI answers or Google Maps handled it.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold">Zero-Click (ZCR)</span> — impressions that didn&apos;t click.
            </li>
            <li>
              <span className="font-semibold">GBP Save-Rate (ZCCO)</span> — calls, directions, messages that happened on-SERP.
            </li>
            <li>
              <span className="font-semibold">Adjusted Zero-Click</span> — ZCR minus ZCCO (the real exposure gap).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

