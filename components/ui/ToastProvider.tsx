"use client";

import { useEffect, useState } from "react";

export function ToastProvider() {
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    function onToast(e: any) {
      const id = Date.now();
      setToasts((t) => [...t, { id, text: e.detail?.text || "Done" }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
    }
    document.addEventListener("dai:toast", onToast as any);
    return () => document.removeEventListener("dai:toast", onToast as any);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="px-3 py-2 rounded bg-white text-black text-sm shadow-lg animate-in slide-in-from-bottom-2">
          {t.text}
        </div>
      ))}
    </div>
  );
}

