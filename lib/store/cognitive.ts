'use client';

import { create } from 'zustand';

type VoiceState = 'idle' | 'listening' | 'speaking' | 'thinking';

interface CognitiveState {
  voice: {
    enabled: boolean;
    state: VoiceState;
  };
  toggleVoice: () => void;
  setVoiceState: (state: VoiceState) => void;
}

export const useCognitiveStore = create<CognitiveState>((set) => ({
  voice: {
    enabled: false,
    state: 'idle'
  },
  toggleVoice: () => set((state) => ({
    voice: {
      ...state.voice,
      enabled: !state.voice.enabled,
      state: !state.voice.enabled ? 'idle' : 'idle'
    }
  })),
  setVoiceState: (newState: VoiceState) => set((state) => ({
    voice: {
      ...state.voice,
      state: newState
    }
  }))
}));

