'use client';

import { create } from 'zustand';

export type PulseLevel = 'critical'|'high'|'medium'|'low';
export interface PulseEvent { 
  id: string; 
  ts: string; 
  level: PulseLevel; 
  title: string; 
  detail?: string; 
  delta?: string|number; 
}

interface HudStore {
  pulse: PulseEvent[];
  pulseOpen: boolean;
  paletteOpen: boolean;
  addPulse: (e: Omit<PulseEvent,'id'|'ts'>) => void;
  clearPulse: () => void;
  setPulseOpen: (open: boolean) => void;
  setPalette: (open: boolean) => void;
}

export const useHudStore = create<HudStore>((set, get) => ({
  pulse: [],
  pulseOpen: false,
  paletteOpen: false,
  addPulse: (e) => set(({ pulse }) => ({
    pulse: [{ id: crypto.randomUUID(), ts: new Date().toISOString(), ...e }, ...pulse].slice(0, 50)
  })),
  clearPulse: () => set({ pulse: [] }),
  setPulseOpen: (open) => set({ pulseOpen: open }),
  setPalette: (open) => set({ paletteOpen: open }),
}));

