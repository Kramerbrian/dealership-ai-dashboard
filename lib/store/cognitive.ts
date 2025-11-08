import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  ActionItem,
  ClarityMetrics,
  CognitiveMode,
  Insight,
  VehicleStatus,
  VoiceState,
} from '@/lib/types/cognitive';

type DrawerContent = {
  title: string;
  description?: string;
  items?: Array<{ label: string; value: string | number; highlight?: boolean }>;
  ctaLabel?: string;
  ctaActionId?: string;
};

interface CognitiveStore extends VehicleStatus {
  setMode: (mode: CognitiveMode) => void;
  toggleVoice: () => void;
  setVoiceState: (state: VoiceState) => void;
  updateClarity: (metrics: Partial<ClarityMetrics>) => void;
  addAction: (action: ActionItem) => void;
  removeAction: (id: string) => void;
  upsertInsight: (insight: Insight) => void;
  drawerOpen: boolean;
  drawerContent: DrawerContent | null;
  openDrawer: (content: DrawerContent) => void;
  closeDrawer: () => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useCognitiveStore = create<CognitiveStore>()(
  persist(
    (set) => ({
      mode: 'drive',
      clarity: {
        score: 78,
        delta: 4,
        trend: 'up',
        components: {
          aiv: 42,
          oel: 12400,
          trust: 85,
          freshness: 72,
        },
      },
      actions: [
        {
          id: 'schema-gap',
          urgency: 'critical',
          title: 'Schema Coverage Gap',
          impact: '$4.7K',
          effort: '5 min',
          category: 'technical',
          autoFixAvailable: true,
          handler: async () => {
            await sleep(400);
            console.info('Deploying schema auto-fix for schema-gap');
          },
        },
        {
          id: 'ugc-velocity',
          urgency: 'high',
          title: 'UGC Response Velocity',
          impact: '+6 Trust',
          effort: '15 min',
          category: 'reputation',
          autoFixAvailable: false,
          handler: async () => {
            await sleep(350);
            console.info('Opening playbook for UGC response velocity');
          },
        },
        {
          id: 'freshness-drop',
          urgency: 'medium',
          title: 'Freshness Score Declining',
          impact: '+12 AIV',
          effort: '30 min',
          category: 'content',
          autoFixAvailable: true,
          handler: async () => {
            await sleep(500);
            console.info('Scheduling freshness automation for freshness-drop');
          },
        },
      ],
      insights: [
        {
          id: 'perplexity-citation-rise',
          title: 'Perplexity citation velocity up 18%',
          description: 'Your dealership is gaining momentum on Perplexity for intent queries in Phoenix.',
          metric: 'citation_velocity',
          delta: 18,
          timeframe: '7 days',
          proof: {
            type: 'chart',
          },
        },
        {
          id: 'geo-inconsistency',
          title: 'Geo trust inconsistent on weekends',
          description: 'Assistant responses drop by 24% on Saturdays due to conflicting hours data.',
          metric: 'geo_integrity',
          delta: -24,
          timeframe: '14 days',
          proof: {
            type: 'screenshot',
          },
        },
      ],
      voice: {
        enabled: false,
        state: 'idle',
      },
      drawerOpen: false,
      drawerContent: null,

      setMode: (mode) => set({ mode }),

      toggleVoice: () =>
        set((state) => ({
          voice: { ...state.voice, enabled: !state.voice.enabled },
        })),

      setVoiceState: (state) =>
        set((store) => ({
          voice: { ...store.voice, state },
        })),

      updateClarity: (metrics) =>
        set((state) => ({
          clarity: {
            ...state.clarity,
            ...metrics,
            components: {
              ...state.clarity.components,
              ...(metrics.components ?? {}),
            },
          },
        })),

      addAction: (action) =>
        set((state) => ({
          actions: [...state.actions, action],
        })),

      removeAction: (id) =>
        set((state) => ({
          actions: state.actions.filter((action) => action.id !== id),
        })),

      upsertInsight: (insight) =>
        set((state) => ({
          insights: state.insights.some((item) => item.id === insight.id)
            ? state.insights.map((item) => (item.id === insight.id ? insight : item))
            : [...state.insights, insight],
        })),

      openDrawer: (content) => set({ drawerOpen: true, drawerContent: content }),

      closeDrawer: () => set({ drawerOpen: false, drawerContent: null }),
    }),
    {
      name: 'dealershipai-cognitive',
      partialize: ({ mode, voice }) => ({ mode, voice }),
    }
  )
);
