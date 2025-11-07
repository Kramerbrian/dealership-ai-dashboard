"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

export type Plan = "free" | "pro" | "enterprise";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Hook to fetch user's plan from server
 * Usage: const { plan, loading } = usePlan();
 */
export function usePlan() {
  const { data, error, isLoading } = useSWR<{ plan: Plan }>(
    "/api/billing/plan",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    plan: (data?.plan || "free") as Plan,
    loading: isLoading,
    error,
  };
}

