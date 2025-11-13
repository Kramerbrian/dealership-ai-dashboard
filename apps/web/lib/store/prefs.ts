'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Prefs = {
  agentEnabled: boolean; // master toggle for PG easter eggs
  pgOnly: boolean; // enforce PG tone (kept on, but user-visible)
  openSettings: boolean; // modal open state (not persisted)
  avoidTopics: string[]; // mirror guardrails (read-only UI)
  setAgentEnabled: (v: boolean) => void;
  setPgOnly: (v: boolean) => void;
  setOpenSettings: (v: boolean) => void;
  setAvoidTopics: (arr: string[]) => void;
  resetPrefs: () => void;
};

const DEFAULTS = {
  agentEnabled: true,
  pgOnly: true,
  openSettings: false,
  avoidTopics: ['politics', 'religion', 'sexual references'],
};

export const usePrefsStore = create<Prefs>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setAgentEnabled: (v) => set({ agentEnabled: v }),
      setPgOnly: (v) => set({ pgOnly: v }),
      setOpenSettings: (v) => set({ openSettings: v }),
      setAvoidTopics: (arr) => set({ avoidTopics: arr }),
      resetPrefs: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'dai:prefs:v1',
      storage: createJSONStorage(() => localStorage),
      // Only persist user prefs (not transient modal open state)
      partialize: (s) => ({
        agentEnabled: s.agentEnabled,
        pgOnly: s.pgOnly,
        avoidTopics: s.avoidTopics,
      }),
      // Migrations if you add new keys later
      version: 1,
      migrate: (state, version) => {
        // future-proof: attach defaults if fields missing
        return { ...DEFAULTS, ...(state as object) } as Prefs;
      },
    }
  )
);

/**
 * Helper: has the store hydrated from localStorage?
 * Returns true once zustand has loaded persisted state.
 */
export const hasPrefsHydrated = (): boolean => {
  try {
    // @ts-ignore zustand persist API
    return usePrefsStore.persist.hasHydrated?.() === true;
  } catch {
    return false;
  }
};

/**
 * Wait for prefs to hydrate (useful for SSR/initial render)
 */
export const waitForPrefsHydration = (): Promise<void> => {
  return new Promise((resolve) => {
    if (hasPrefsHydrated()) {
      resolve();
      return;
    }

    // @ts-ignore zustand persist API
    const unsub = usePrefsStore.persist.onFinishHydration?.(() => {
      unsub?.();
      resolve();
    });

    // Fallback timeout
    setTimeout(resolve, 100);
  });
};
