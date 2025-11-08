import { create } from 'zustand';

interface OnboardingState {
  step: number;
  dealerUrl: string;
  email: string;
  competitors: string[];
  scansLeft: number;
  setStep: (step: number) => void;
  setUrl: (url: string) => void;
  setEmail: (email: string) => void;
  toggleCompetitor: (name: string) => void;
  decScan: () => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  step: 1,
  dealerUrl: '',
  email: '',
  competitors: [],
  scansLeft: 3,
  setStep: (step) => set({ step }),
  setUrl: (url) => set({ dealerUrl: url }),
  setEmail: (email) => set({ email }),
  toggleCompetitor: (name) =>
    set((state) => ({
      competitors: state.competitors.includes(name)
        ? state.competitors.filter((c) => c !== name)
        : [...state.competitors, name]
    })),
  decScan: () => set((state) => ({ scansLeft: Math.max(0, state.scansLeft - 1) })),
  reset: () =>
    set({
      step: 1,
      dealerUrl: '',
      email: '',
      competitors: [],
      scansLeft: 3
    })
}));
