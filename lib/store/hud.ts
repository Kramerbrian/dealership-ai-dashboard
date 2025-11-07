'use client';

import { create } from 'zustand';

export interface Pulse {
  id: string;
  ts: string;
  level: 'low' | 'medium' | 'high';
  title: string;
  detail?: string;
}

interface HudState {
  pulses: Pulse[];
  addPulse: (pulse: Omit<Pulse, 'id' | 'ts'>) => void;
  removePulse: (id: string) => void;
}

export const useHudStore = create<HudState>((set) => ({
  pulses: [],
  addPulse: (pulse) => set((state) => ({
    pulses: [
      ...state.pulses,
      {
        ...pulse,
        id: crypto.randomUUID(),
        ts: new Date().toISOString()
      }
    ]
  })),
  removePulse: (id) => set((state) => ({
    pulses: state.pulses.filter(p => p.id !== id)
  }))
}));

