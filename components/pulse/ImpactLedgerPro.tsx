"use client";

import { useMemo } from "react";
import { useReceiptPolling } from "@/lib/hooks/useReceiptPolling";

type Receipt = {
  id: string;
  ts: string;
  actor: "human"|"agent";
  action: string;
  context?: any;
  deltaUSD?: number;     // undefined = pending
  undoable?: boolean;
  undone?: boolean;
};

export default function ImpactLedgerPro({
  receipts,
  onPatch,
  onExport
}: {
  receipts: Receipt[];
  onPatch: (id: string, patch: Partial<Receipt>) => void;
  onExport: (fmt: "csv"|"pdf") => void;
}) {
  // poll for ones without final delta
  useReceiptPolling(receipts, onPatch, 15000);

  const total = useMemo(() => {
    return receipts.reduce((s, r) => s + (typeof r.deltaUSD === "number" ? r.deltaUSD : 0), 0);
  }, [receipts]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg">Impact Ledger</div>
        <div className="flex gap-2">
          <button onClick={()=>onExport("csv")} className="text-sm px-3 py-1.5 rounded-full border border-white/15">Export CSV</button>
          <button onClick={()=>onExport("pdf")} className="text-sm px-3 py-1.5 rounded-full border border-white/15">Export PDF</button>
        </div>
      </div>
      <div className="mt-2 text-sm text-white/70">
        Recovered (projected+final): <span className="text-white font-medium">${total.toLocaleString()}</span>/mo
      </div>
      <div className="mt-3 divide-y divide-white/10">
        {receipts.map(r=>(
          <div key={r.id} className="py-3 text-sm flex items-start justify-between">
            <div>
              <div className="text-white/90">{r.action}</div>
              <div className="text-white/50">{new Date(r.ts).toLocaleString()} • {r.actor} • {r.context || "dashboard"}</div>
            </div>
            <div className="flex items-center gap-2">
              {r.undone ? (
                <span className="text-amber-400 font-medium">Undone</span>
              ) : (typeof r.deltaUSD === "number") ? (
                <span className={`font-medium ${r.deltaUSD>=0 ? "text-green-400" : "text-red-400"}`}>
                  {r.deltaUSD>=0 ? "+" : "-"}${Math.abs(r.deltaUSD).toLocaleString()}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-white/60">
                  <span className="h-2 w-2 rounded-full bg-white/30 animate-pulse" /> pending…
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
