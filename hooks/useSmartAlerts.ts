// hooks/useSmartAlerts.ts

"use client";

import { useCallback, useState } from "react";

export function useSmartAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const evaluate = useCallback(async (payload: any) => {
    const r = await fetch("/api/alerts/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    setAlerts(j.alerts || []);
    return j.alerts || [];
  }, []);
  return { alerts, evaluate };
}

