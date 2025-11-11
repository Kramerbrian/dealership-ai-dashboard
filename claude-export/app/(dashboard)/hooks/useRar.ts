"use client";

import useSWR from "swr";
import { getApiBase } from "@/lib/apiConfig";

export type RarDriver = { label: string; impact: number }; // % of total risk
export type RarResponse = {
  monthly: number;    // e.g. 45000
  annual: number;     // e.g. 540000
  confidence: number; // 0..1
  drivers: RarDriver[];
};

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
});

export function useRar(domain?: string) {
  const base = getApiBase();
  const key = domain ? `${base}/metrics/rar?domain=${encodeURIComponent(domain)}` : null;
  const { data, error, isLoading, mutate } = useSWR<RarResponse>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  });

  return {
    rar: data,
    rarError: error,
    rarLoading: isLoading,
    refreshRar: mutate
  };
}

