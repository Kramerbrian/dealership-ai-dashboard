import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CognitiveMode, VehicleStatus, VoiceState, Incident, PulseEvent } from '@/lib/types/cognitive';

const URGENCY_W: Record<Incident['urgency'], number> = {
  critical: 1.0, high: 0.65, medium: 0.35, low: 0.15
};

const floorTime = (min: number) => Math.max(5, Math.round(min));

function scoreIncident(i: Incident) {
  const u = URGENCY_W[i.urgency] ?? 0.2;
  return (i.impact_points * u) / floorTime(i.time_to_fix_min);
}

function dedupe<T extends { id: string }>(rows: T[]): T[] {
  const m = new Map<string, T>();
  rows.forEach(r => m.set(r.id, r));
  return Array.from(m.values());
}

interface CognitiveStore extends VehicleStatus {
  // Incidents & Pulse
  incidents: Incident[];
  pulse: PulseEvent[];
  upsertIncidents: (rows: Incident[]) => void;
  resolveIncident: (id: string) => void;
  addPulse: (ev: PulseEvent) => void;
  getTriageQueue: () => Incident[];

  // Mode Management
  setMode: (mode: CognitiveMode) => void;

  // Voice
  toggleVoice: () => void;
  setVoiceState: (state: VoiceState) => void;

  // Metrics
  updateClarity: (metrics: Partial<VehicleStatus['clarity']>) => void;

  // Drawer
  drawerOpen: boolean;
  drawerContent: any;
  openDrawer: (content: any) => void;
  closeDrawer: () => void;
}

export const useCognitiveStore = create<CognitiveStore>()(
  persist(
    (set, get) => ({
      // Initial State
      mode: 'drive',
      clarity: {
        score: 78,
        delta: 4,
        trend: 'up',
        components: { aiv: 42, oel: 12400, trust: 85, freshness: 72 },
      },
      actions: [],
      insights: [],
      voice: { enabled: false, state: 'idle' },

      incidents: [],
      pulse: [],

      drawerOpen: false,
      drawerContent: null,

      // Incidents & Pulse
      upsertIncidents: (rows) => set((s) => ({ incidents: dedupe([...rows, ...s.incidents]) })),
      resolveIncident: (id) => set((s) => ({ incidents: s.incidents.filter(i => i.id !== id) })),
      addPulse: (ev) => set((s) => ({ pulse: [ev, ...s.pulse].slice(0, 200) })),
      getTriageQueue: () => {
        const { incidents } = get();
        return [...incidents].sort((a, b) => scoreIncident(b) - scoreIncident(a));
      },

      // Mode
      setMode: (mode) => set({ mode }),

      // Voice
      toggleVoice: () => set((state) => ({ voice: { ...state.voice, enabled: !state.voice.enabled } })),
      setVoiceState: (voiceState) => set((state) => ({ voice: { ...state.voice, state: voiceState } })),

      // Metrics
      updateClarity: (metrics) => set((state) => ({ clarity: { ...state.clarity, ...metrics } })),

      // Drawer
      openDrawer: (content) => set({ drawerOpen: true, drawerContent: content }),
      closeDrawer: () => set({ drawerOpen: false, drawerContent: null }),
    }),
    {
      name: 'dealershipai-cognitive',
      partialize: (state) => ({ mode: state.mode, voice: state.voice }),
    }
  )
);
