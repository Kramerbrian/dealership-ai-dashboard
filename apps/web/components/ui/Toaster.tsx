'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Toast = { id: string; text: string; kind?: 'info' | 'success' | 'warning' | 'error' };

type ToastContextType = { push: (t: Omit<Toast, 'id'>) => void };

const ToastCtx = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToasterProvider/>');
  return ctx;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);

  function push(t: Omit<Toast, 'id'>) {
    const id = `${Date.now()}_${Math.random()}`;
    setList(prev => [...prev, { id, ...t }]);
    setTimeout(() => {
      setList(prev => prev.filter(x => x.id !== id));
    }, 3500);
  }

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[120] space-y-2">
        {list.map(item => (
          <div
            key={item.id}
            className={`px-4 py-2 rounded border text-sm backdrop-blur-xl ${
              item.kind === 'success'
                ? 'bg-emerald-600/20 border-emerald-400/50 text-emerald-100'
                : item.kind === 'warning'
                ? 'bg-amber-600/20 border-amber-400/50 text-amber-100'
                : item.kind === 'error'
                ? 'bg-red-600/20 border-red-400/50 text-red-100'
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            {item.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

