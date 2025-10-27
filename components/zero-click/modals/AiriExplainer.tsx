'use client';

import { X, Cog } from 'lucide-react';

export default function AiriExplainer({ 
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
            <Cog className="h-5 w-5" />
            <h3 className="font-semibold">AI Replacement Index</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pb-4 text-sm leading-6">
          <p className="mb-3">
            Not all visibility equals traffic. AIRI estimates how much potential traffic AI answers absorbed.
          </p>
          <p className="opacity-80 mb-3">
            Formula: <span className="font-semibold">AI presence × (CTR baseline − CTR actual)</span>
          </p>
          <p className="mt-2">
            Action: Improve trust signals and structured answers so AI cites your site and brand — not just summarizes competitors.
          </p>
        </div>
      </div>
    </div>
  );
}

