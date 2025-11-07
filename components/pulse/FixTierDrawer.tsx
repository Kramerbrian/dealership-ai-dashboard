// components/pulse/FixTierDrawer.tsx
'use client';

import React from 'react';

export default function FixTierDrawer({
  open,
  onClose,
  preview,
  onApply,
  onAutopilot,
  onUndo
}: {
  open: boolean;
  onClose: () => void;
  preview: any;
  onApply: () => Promise<{ ok: boolean; receiptId?: string }>;
  onAutopilot: () => Promise<{ ok: boolean }>;
  onUndo: () => Promise<{ ok: boolean }>;
}) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white text-black rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Fix Preview</h2>
        <p className="mb-4">{preview?.summary || 'No preview available'}</p>
        <div className="flex gap-2">
          <button onClick={onApply} className="px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
          <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
