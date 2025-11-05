"use client";

import { useEffect, useState } from "react";
import { initTheme, DEFAULT_THEME } from "@/lib/theme";

/**
 * React Hook for dynamic theme binding
 */
export function useDealerTheme(dealerId: string) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    (async () => {
      const dealerTheme = await initTheme(dealerId);
      setTheme(dealerTheme);
    })();
  }, [dealerId]);

  return theme;
}

