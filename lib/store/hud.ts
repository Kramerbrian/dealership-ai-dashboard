'use client';

import { create } from 'zustand';
import { PulseCard, PulseThread } from '@/lib/types/pulse';

export type PulseLevel = 'critical'|'high'|'medium'|'low';
export interface PulseEvent {
  id: string;
  ts: string;
  level: PulseLevel;
  title: string;
  detail?: string;
  delta?: string|number;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface HudStore {
  pulse: PulseCard[];
  pulseOpen: boolean;
  paletteOpen: boolean;
  pulseDockOpen: boolean;
  filter: string;
  toasts: Toast[];
  addPulse: (e: Omit<PulseCard,'id'|'ts'>) => void;
  addManyPulse: (events: PulseCard[]) => void;
  clearPulse: () => void;
  setPulseOpen: (open: boolean) => void;
  setPalette: (open: boolean) => void;
  setPulseDock: (open: boolean) => void;
  mute: (dedupe_key: string) => void;
  threadFor: (ref: { type: string; id: string }) => PulseThread | null;
  addToast: (message: string, type: 'info' | 'success' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useHudStore = create<HudStore>((set, get) => ({
  pulse: [],
  pulseOpen: false,
  paletteOpen: false,
  pulseDockOpen: false,
  filter: '',
  toasts: [],
  addPulse: (e) => set(({ pulse }) => ({
    pulse: [{ id: crypto.randomUUID(), ts: new Date().toISOString(), ...e }, ...pulse].slice(0, 50)
  })),
  addManyPulse: (events) => set(({ pulse }) => ({
    pulse: [...events, ...pulse].slice(0, 50)
  })),
  clearPulse: () => set({ pulse: [] }),
  setPulseOpen: (open) => set({ pulseOpen: open }),
  setPalette: (open) => set({ paletteOpen: open }),
  setPulseDock: (open) => set({ pulseDockOpen: open }),
  mute: (dedupe_key) => set(({ pulse }) => ({
    pulse: pulse.filter(p => p.dedupe_key !== dedupe_key)
  })),
  threadFor: (ref) => {
    const { pulse } = get();
    const events = pulse.filter(p => p.thread && p.thread.type === ref.type && p.thread.id === ref.id);
    if (events.length === 0) return null;
    return {
      id: `${ref.type}-${ref.id}`,
      ref: ref as any,
      events,
      createdAt: events[events.length - 1].ts,
      updatedAt: events[0].ts,
    };
  },
  addToast: (message, type, duration = 3000) => {
    const id = crypto.randomUUID();
    set(({ toasts }) => ({ toasts: [...toasts, { id, message, type }] }));
    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration);
    }
  },
  removeToast: (id) => set(({ toasts }) => ({
    toasts: toasts.filter(t => t.id !== id)
  })),
}));

