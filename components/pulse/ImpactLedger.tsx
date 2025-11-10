"use client";

import { Download } from "lucide-react";

interface Receipt {
  id: string;
  ts: string;
  actor: string;
  action: string;
  context: string;
  deltaUSD: number;
  undoable: boolean;
}

interface ImpactLedgerProps {
  receipts: Receipt[];
  onExport?: (format: 'csv' | 'json') => void;
}

export default function ImpactLedger({ receipts, onExport }: ImpactLedgerProps) {
  const totalImpact = receipts.reduce((sum, r) => sum + r.deltaUSD, 0);

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Action', 'Impact (USD)', 'Context'];
      const rows = receipts.map(r => [
        r.id,
        new Date(r.ts).toISOString(),
        r.action,
        r.deltaUSD.toString(),
        r.context
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `impact-ledger-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(receipts, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `impact-ledger-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onExport?.(format);
  };

  return (
    <div className="bg-white/2 border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-white/80 font-semibold">Impact Ledger</div>
          <div className="text-sm text-white/50 mt-1">
            Total: ${(totalImpact / 1000).toFixed(1)}K/mo recovered
          </div>
        </div>
        {receipts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>
          </div>
        )}
      </div>

      {receipts.length === 0 ? (
        <div className="text-white/50 text-sm py-8 text-center">
          No actions yet. Apply fixes to see impact here.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {receipts.map((r) => (
            <div
              key={r.id}
              className="border-b border-white/10 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-white/80 text-sm font-medium">{r.action}</div>
                  <div className="text-white/50 text-xs mt-1">
                    {new Date(r.ts).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm font-semibold">
                    +${(r.deltaUSD / 1000).toFixed(1)}K/mo
                  </div>
                  {r.undoable && (
                    <div className="text-xs text-white/40 mt-1">Undoable</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

