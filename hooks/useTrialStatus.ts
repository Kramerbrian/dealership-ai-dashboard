"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Trial = { feature: string; expiresAt: string };

export function useTrialStatus() {
  const cacheRef = useRef<{ list: Trial[]; ts: number }>({ list: [], ts: 0 });
  const [tick, setTick] = useState(0);

  async function refresh() {
    try {
      const r = await fetch("/api/trial/status", { cache: "no-store" });
      const j = (await r.json()) as { active: Trial[] };
      cacheRef.current = { list: j.active || [], ts: Date.now() };
      setTick((x) => x + 1);
    } catch {}
  }

  useEffect(() => {
    refresh();
    const onGrant = () => refresh();
    window.addEventListener("dai:trial_granted", onGrant as any);
    const id = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => {
      window.removeEventListener("dai:trial_granted", onGrant as any);
      clearInterval(id);
    };
  }, []);

  return useMemo(() => {
    return {
      list: cacheRef.current.list,
      get(feature: string) {
        const item = cacheRef.current.list.find((t) => t.feature === feature);
        if (!item) return { active: false, msLeft: 0 };
        const msLeft = Math.max(0, new Date(item.expiresAt).getTime() - Date.now());
        return { active: msLeft > 0, msLeft };
      },
      format(ms: number) {
        const m = Math.max(0, Math.floor(ms / 60_000));
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
      },
    };
  }, [tick]);
}
