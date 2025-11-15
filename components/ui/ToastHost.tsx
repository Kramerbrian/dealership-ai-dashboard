// @ts-nocheck
'use client';

import { useToastStore } from '@/lib/store/toast';
import { TOKENS } from '@/styles/design-tokens';

const tone = (lvl: 'info'|'success'|'warning'|'error') => {
  switch (lvl) {
    case 'success': return TOKENS.color.accent.emerald || '#10b981';
    case 'warning': return '#f59e0b';
    case 'error':   return '#ef4444';
    default:        return TOKENS.color.accent.cyan || '#06b6d4';
  }
};

export default function ToastHost() {
  const { items, dismiss } = useToastStore();
  
  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {items.map(t => (
        <div 
          key={t.id}
          className="rounded-2xl border px-4 py-3 max-w-sm shadow-lg backdrop-blur-md"
          style={{
            background: TOKENS.color.surface.panel,
            borderColor: TOKENS.color.surface.border,
            color: TOKENS.color.text.primary,
            boxShadow: TOKENS.shadow.soft
          }}
        >
          <div className="flex gap-2">
            <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: tone(t.level) }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.message && (
                <div className="text-xs mt-1" style={{ color: TOKENS.color.text.secondary }}>
                  {t.message}
                </div>
              )}
            </div>
            <button 
              className="text-xs opacity-70 hover:opacity-100 flex-shrink-0 ml-2"
              style={{ color: TOKENS.color.text.secondary }}
              onClick={() => dismiss(t.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

