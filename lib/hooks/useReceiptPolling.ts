"use client";

import { useEffect } from "react";

type Receipt = { id: string; undone?: boolean; deltaUSD?: number };

export function useReceiptPolling(
  receipts: Receipt[],
  update: (id: string, patch: Partial<Receipt>) => void,
  intervalMs = 20000
) {
  useEffect(() => {
    const pending = receipts.filter(r => !r.undone && (r.deltaUSD === undefined || r.deltaUSD === null));

    if (pending.length === 0) return;

    let alive = true;

    const ids = pending.map(p => p.id);

    async function tick() {
      try {
        await Promise.all(ids.map(async (id) => {
          const res = await fetch(`/api/fix/status/${id}`, { cache: "no-store" });
          if (!res.ok) return;
          const json = await res.json();
          // If final delta arrived or undone, update
          if (alive && (typeof json.deltaUSD === "number" || json.undone === true)) {
            update(id, { deltaUSD: json.deltaUSD, undone: json.undone });
          }
        }));
      } catch { /* noop */ }
    }

    // immediate + interval
    tick();
    const t = setInterval(tick, intervalMs);

    return () => { alive = false; clearInterval(t); };
  }, [receipts, update, intervalMs]);
}
