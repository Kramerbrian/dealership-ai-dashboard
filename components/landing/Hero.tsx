'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEasterEggQuote } from '@/lib/agent/quoteEngine';
import { playSonic } from '@/lib/sound/palette';
import { tap } from '@/lib/sound/haptics';
import { useToast } from '@/components/ui/Toast';

// Simple design tokens (matching the design system)
const TOKENS = {
  color: {
    surface: {
      border: 'rgba(255, 255, 255, 0.12)'
    },
    text: {
      primary: '#ffffff',
      muted: '#a1a1aa'
    }
  }
};

function PromptDemo() {
  const [msg, setMsg] = useState('Ask me about your clarity score…');
  const [egg, setEgg] = useState<{quote: string; source: string} | null>(null);
  const { showToast: showToastUI } = useToast();
  
  useEffect(() => {
    const id = setTimeout(() => setMsg('"What\'s my AI visibility today?"'), 1600);
    // attempt a subtle, PG-safe easter egg
    const q = getEasterEggQuote();
    if (q) setEgg({ quote: q.quote, source: q.source });
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-[88%]">
      <div className="relative">
        <input
          className="w-full rounded-full px-4 py-3 text-sm pr-12 outline-none"
          placeholder={msg}
          style={{ 
            background: 'rgba(13,17,23,0.6)', 
            border: `1px solid ${TOKENS.color.surface.border}`, 
            color: TOKENS.color.text.primary 
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          aria-label="Ask about AI visibility or compare markets"
        />
        {/* subtle mic button (right inside input) */}
        <button
          onClick={() => {
            playSonic('pulse');
            tap();
            const q = getEasterEggQuote();
            const line = q ? `"${q.quote}" — ${q.source}` : 'You're closer than you think. One fix, then the next.';
            setEgg({ quote: line, source: q ? q.source : 'coach' });
            showToastUI(q ? 'success' : 'info', q ? 'PG-safe boost engaged.' : 'Keeping it subtle today.', { duration: 3000 });
          }}
          aria-label="Give me a short boost"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border flex items-center justify-center"
          style={{ 
            borderColor: TOKENS.color.surface.border, 
            background: 'rgba(59,130,246,0.10)',
            cursor: 'pointer'
          }}
        >
          <span 
            aria-hidden 
            className="block w-1.5 h-5 rounded" 
            style={{ 
              background: 'linear-gradient(180deg, rgba(59,130,246,.8), rgba(6,182,212,.7))' 
            }} 
          />
        </button>
      </div>
      {egg && (
        <div 
          className="mt-2 text-[11px] text-center opacity-80"
          style={{ color: TOKENS.color.text.muted }}
        >
          "{egg.quote}" — <span className="opacity-90">{egg.source}</span>
        </div>
      )}
      <div className="mt-2 text-xs text-center" style={{ color: TOKENS.color.text.muted }}>
        Try: "Compare Naples vs Fort Myers GEO"
      </div>
    </div>
  );
}

export default PromptDemo;

