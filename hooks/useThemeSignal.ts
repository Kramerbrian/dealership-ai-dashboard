"use client";

import { useEffect } from "react";
import { applyThemeSignal } from "@/lib/theme-controller";

export function useThemeSignal(mood: string, tone: string) {
  useEffect(() => {
    applyThemeSignal({ mood: mood as any, tone: tone as any });
  }, [mood, tone]);
}

