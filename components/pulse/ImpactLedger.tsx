// components/pulse/ImpactLedger.tsx
'use client';

import React from 'react';

export default function ImpactLedger({
  receipts,
  onExport
}: {
  receipts: any[];
  onExport: (format: string) => void;
}) {
  return (
    <div className="border border-white/10 rounded-lg p-4 bg-white/5">
      <h3 className="font-medium mb-3">Impact Ledger</h3>
      {receipts.length === 0 ? (
        <p className="text-sm text-white/60">No actions yet</p>
      ) : (
        <div className="space-y-2">
          {receipts.map((r) => (
            <div key={r.id} className="text-sm border-b border-white/10 pb-2">
              <div className="font-medium">{r.action}</div>
              <div className="text-white/60">${r.deltaUSD?.toLocaleString()}/mo</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
