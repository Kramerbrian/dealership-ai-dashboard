'use client';

import { create } from 'zustand';

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';
export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  level: ToastLevel;
  timeoutMs?: number;
}

interface ToastStore {
  items: ToastItem[];
  show: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  items: [],
  show: (t) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { timeoutMs: 3000, ...t, id };
    set((s) => ({ items: [item, ...s.items].slice(0, 5) }));
    if (item.timeoutMs && item.timeoutMs > 0) {
      setTimeout(() => get().dismiss(id), item.timeoutMs);
    }
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
  clear: () => set({ items: [] })
}));

export const showToast = (args: Omit<ToastItem, 'id'>) => useToastStore.getState().show(args);

