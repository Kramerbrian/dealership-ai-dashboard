/**
 * Pulse Store - Decision Inbox State Management
 * Handles ingestion, deduplication, threading, and lifecycle rules
 */

import { create } from 'zustand';
import type { PulseCard, PulseThread, PulseFilter, PulseKind, PulseLevel } from '@/lib/types/pulse';

const BUNDLE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PULSE_CARDS = 200;
const MAX_THREAD_EVENTS = 100;

interface PulseStore {
  pulse: PulseCard[];
  threads: Record<string, PulseThread>;
  muted: Record<string, number>; // dedupe_key -> expiresAt
  filter: PulseFilter;
  digestMode: boolean;
  selectedThread: string | null;

  // Actions
  addPulse: (card: PulseCard) => void;
  addManyPulse: (cards: PulseCard[]) => void;
  mute: (key: string, ttlMin: number) => void;
  unmute: (key: string) => void;
  threadFor: (ref: { type: 'incident' | 'kpi' | 'market'; id: string }) => PulseThread | null;
  setFilter: (filter: PulseFilter) => void;
  setDigestMode: (enabled: boolean) => void;
  setSelectedThread: (threadId: string | null) => void;
  clearExpired: () => void;
  promoteToIncident: (card: PulseCard) => void;
  snooze: (cardId: string, duration: '15m' | '1h' | 'end_of_day') => void;
}

/**
 * Ingest logic with deduplication, bundling, and lifecycle rules
 */
function ingest(
  newCards: PulseCard[],
  currentState: {
    pulse: PulseCard[];
    threads: Record<string, PulseThread>;
    muted: Record<string, number>;
  }
): { pulse: PulseCard[]; threads: Record<string, PulseThread> } {
  const now = Date.now();
  const { pulse: existingPulse, threads: existingThreads, muted } = currentState;
  const keep: PulseCard[] = [];
  const updatedThreads = { ...existingThreads };

  for (const card of newCards) {
    // Check if muted
    if (card.dedupe_key && muted[card.dedupe_key] && muted[card.dedupe_key] > now) {
      continue;
    }

    // Check TTL
    if (card.ttl_sec) {
      const cardAge = now - Date.parse(card.ts);
      if (cardAge > card.ttl_sec * 1000) {
        continue;
      }
    }

    // Deduplication: check for existing card with same dedupe_key within window
    const existing = existingPulse.find(
      (p) =>
        p.dedupe_key &&
        p.dedupe_key === card.dedupe_key &&
        now - Date.parse(p.ts) < BUNDLE_WINDOW_MS
    );

    if (existing) {
      // Collapse: update existing card or skip
      continue;
    }

    keep.push(card);

    // Update thread if card has thread reference
    if (card.thread) {
      const threadId = card.thread.id;
      const existingThread = updatedThreads[threadId] || {
        id: threadId,
        ref: card.thread,
        events: [],
        createdAt: card.ts,
        updatedAt: card.ts,
      };

      existingThread.events = [card, ...existingThread.events].slice(0, MAX_THREAD_EVENTS);
      existingThread.updatedAt = card.ts;
      updatedThreads[threadId] = existingThread;
    }
  }

  // Merge with existing, limit to MAX_PULSE_CARDS
  const merged = [...keep, ...existingPulse]
    .sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts))
    .slice(0, MAX_PULSE_CARDS);

  return { pulse: merged, threads: updatedThreads };
}

export const usePulseStore = create<PulseStore>((set, get) => ({
  pulse: [],
  threads: {},
  muted: {},
  filter: 'all',
  digestMode: false,
  selectedThread: null,

  addPulse: (card) => {
    const state = get();
    const result = ingest([card], state);
    set({ pulse: result.pulse, threads: result.threads });
  },

  addManyPulse: (cards) => {
    const state = get();
    const result = ingest(cards, state);
    set({ pulse: result.pulse, threads: result.threads });
  },

  mute: (key, ttlMin) => {
    set((state) => ({
      muted: {
        ...state.muted,
        [key]: Date.now() + ttlMin * 60 * 1000,
      },
    }));
  },

  unmute: (key) => {
    set((state) => {
      const { [key]: _, ...rest } = state.muted;
      return { muted: rest };
    });
  },

  threadFor: (ref) => {
    const state = get();
    return state.threads[ref.id] || null;
  },

  setFilter: (filter) => set({ filter }),

  setDigestMode: (enabled) => set({ digestMode: enabled }),

  setSelectedThread: (threadId) => set({ selectedThread: threadId }),

  clearExpired: () => {
    const now = Date.now();
    set((state) => ({
      pulse: state.pulse.filter((card) => {
        if (card.ttl_sec) {
          const age = now - Date.parse(card.ts);
          return age <= card.ttl_sec * 1000;
        }
        return true;
      }),
      muted: Object.fromEntries(
        Object.entries(state.muted).filter(([_, expiresAt]) => expiresAt > now)
      ),
    }));
  },

  promoteToIncident: (card) => {
    // Auto-promotion logic - will be handled by API
    // This triggers the incident creation
    console.log('Promoting to incident:', card);
  },

  snooze: (cardId, duration) => {
    const durations = {
      '15m': 15,
      '1h': 60,
      'end_of_day': (() => {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        return Math.ceil((endOfDay.getTime() - now.getTime()) / (60 * 1000));
      })(),
    };

    const card = get().pulse.find((p) => p.id === cardId);
    if (card?.dedupe_key) {
      get().mute(card.dedupe_key, durations[duration]);
    }
  },
}));

// Auto-clear expired cards every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    usePulseStore.getState().clearExpired();
  }, 60 * 1000);
}

