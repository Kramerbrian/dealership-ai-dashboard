'use client';
import { create } from 'zustand';

export type PulseLevel = 'critical' | 'high' | 'medium' | 'low';

export interface PulseEvent {
  id: string;
  ts: string;
  level: PulseLevel;
  title: string;
  detail?: string;
  delta?: string | number;
}

export interface ToastEvent {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface HudStore {
  pulse: PulseEvent[];
  paletteOpen: boolean;
  pulseDockOpen: boolean;
  toasts: ToastEvent[];
  addPulse: (e: Omit<PulseEvent, 'id' | 'ts'>) => void;
  clearPulse: () => void;
  setPalette: (open: boolean) => void;
  setPulseDock: (open: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useHudStore = create<HudStore>((set, get) => ({
  pulse: [],
  paletteOpen: false,
  pulseDockOpen: false,
  toasts: [],

  addPulse: (e) =>
    set(({ pulse }) => ({
      pulse: [
        { id: crypto.randomUUID(), ts: new Date().toISOString(), ...e },
        ...pulse,
      ].slice(0, 50),
    })),

  clearPulse: () => set({ pulse: [] }),

  setPalette: (open) => set({ paletteOpen: open }),

  setPulseDock: (open) => set({ pulseDockOpen: open }),

  addToast: (message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    const toast: ToastEvent = { id, message, type, duration };

    set(({ toasts }) => ({ toasts: [...toasts, toast] }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) =>
    set(({ toasts }) => ({ toasts: toasts.filter((t) => t.id !== id) })),
}));
