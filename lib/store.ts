import { create } from 'zustand';

interface OnboardingState {
  step: number;
  dealerUrl: string;
  email: string;
  competitors: string[];
  scansLeft: number;
  pvr?: string;
  adExpensePvr?: string;
  setStep: (n: number) => void;
  setUrl: (s: string) => void;
  setEmail: (s: string) => void;
  toggleCompetitor: (name: string) => void;
  decScan: () => void;
  setPvr?: (s: string) => void;
  setAdExpensePvr?: (s: string) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>((set, get) => ({
  step: 1,
  dealerUrl: '',
  email: '',
  competitors: [],
  scansLeft: Number(typeof window !== 'undefined' ? localStorage.getItem('plg_scans_left') || '3' : '3'),
  pvr: undefined,
  adExpensePvr: undefined,
  setStep: (n) => set({ step: n }),
  setUrl: (s) => set({ dealerUrl: s }),
  setEmail: (s) => set({ email: s }),
  toggleCompetitor: (name) => {
    const cur = get().competitors;
    const next = cur.includes(name) ? cur.filter(x => x !== name) : [...cur, name];
    set({ competitors: next });
  },
  decScan: () => {
    const next = Math.max(0, get().scansLeft - 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('plg_scans_left', String(next));
    }
    set({ scansLeft: next });
  },
  setPvr: (s) => set({ pvr: s }),
  setAdExpensePvr: (s) => set({ adExpensePvr: s }),
  reset: () => set({
    step: 1,
    dealerUrl: '',
    email: '',
    competitors: [],
    scansLeft: Number(typeof window !== 'undefined' ? localStorage.getItem('plg_scans_left') || '3' : '3'),
    pvr: undefined,
    adExpensePvr: undefined,
  })
}));
