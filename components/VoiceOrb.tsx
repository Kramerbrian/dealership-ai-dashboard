'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCognitiveStore } from '@/lib/store/cognitive';
import { TOKENS } from '@/styles/design-tokens';
import { getEasterEggQuote } from '@/lib/agent/quoteEngine';
import { playSonic } from '@/lib/sound/palette';
import { tap, doubleTap } from '@/lib/sound/haptics';
import { useHudStore } from '@/lib/store/hud';
import { showToast } from '@/lib/store/toast';
import { useToast } from '@/components/ui/Toast';

type Intent = 'boost' | 'quote' | 'pep' | 'none';

export default function VoiceOrb() {
  const { voice, toggleVoice, setVoiceState } = useCognitiveStore();
  const { addPulse } = useHudStore();
  const { showToast: showToastUI } = useToast();
  const [bubble, setBubble] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const holdTimer = useRef<number | null>(null);

  const ring = useMemo(() => {
    switch (voice.state) {
      case 'listening': return '0 0 40px rgba(6,182,212,.35)';
      case 'speaking':  return '0 0 44px rgba(59,130,246,.45)';
      case 'thinking':  return '0 0 36px rgba(59,130,246,.25)';
      default:          return '0 0 28px rgba(59,130,246,.25)';
    }
  }, [voice.state]);

  function parseIntent(txt: string): Intent {
    const t = (txt || '').toLowerCase();
    if (/(boost|pep|motivat|encourage|hype)/i.test(t)) return 'boost';
    if (/(quote|line|movie|egg|surprise)/i.test(t)) return 'quote';
    return 'none';
  }

  function say(line: string, meta?: { title?: string; level?: 'low' | 'medium' | 'high' }) {
    setVoiceState('speaking');
    setBubble(line);
    playSonic('pulse');
    tap();
    if (meta?.title) {
      addPulse({ 
        level: meta.level ?? 'low', 
        title: meta.title, 
        detail: line 
      });
    }
    setTimeout(() => {
      setVoiceState('idle');
      setBubble(null);
    }, 2000);
  }

  async function handleIntent(intent: Intent) {
    if (busy) return;
    setBusy(true);
    setVoiceState('thinking');
    playSonic('autofix');
    tap();

    // try scarcity-gated PG quote
    const q = getEasterEggQuote();
    let line: string;

    if (q) {
      line = `"${q.quote}" — ${q.source}`;
      showToastUI('success', 'PG-safe boost engaged.', { duration: 3000 });
      doubleTap();
      say(line, { title: 'Coach • Boost', level: 'low' });
    } else {
      // graceful fallback: confident coach tone, no pop refs
      line = "You're closer than you think. One fix, then the next.";
      showToastUI('info', 'Keeping it subtle today.', { duration: 3000 });
      say(line, { title: 'Coach • Boost', level: 'low' });
    }
    
    setTimeout(() => setBusy(false), 500);
  }

  function onTap() {
    toggleVoice();
    // if turning on, give a calm ping
    if (!voice.enabled) {
      playSonic('pulse');
      tap();
    }
  }

  function onHoldStart() {
    if (holdTimer.current) return;
    holdTimer.current = window.setTimeout(() => {
      // long-press triggers a boost immediately
      if (!voice.enabled) toggleVoice();
      handleIntent('boost');
    }, 520) as unknown as number;
  }

  function onHoldEnd() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
      }
    };
  }, []);

  return (
    <div className="fixed right-6 bottom-20 z-40 select-none">
      {/* Bubble */}
      {bubble && (
        <div
          className="mb-3 max-w-[320px] rounded-2xl border px-4 py-3"
          style={{
            background: TOKENS.color.surface.panel,
            borderColor: TOKENS.color.surface.border,
            color: TOKENS.color.text.primary,
            boxShadow: TOKENS.shadow['soft-1']
          }}
          aria-live="polite"
        >
          {bubble}
        </div>
      )}

      {/* Orb */}
      <button
        onMouseDown={onHoldStart}
        onMouseUp={onHoldEnd}
        onMouseLeave={onHoldEnd}
        onTouchStart={onHoldStart}
        onTouchEnd={onHoldEnd}
        onClick={onTap}
        aria-label={voice.enabled ? 'Disable voice coach' : 'Enable voice coach'}
        className="relative w-14 h-14 rounded-full border cursor-pointer"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,0.28), rgba(6,182,212,0.14) 40%, rgba(0,0,0,0) 70%)',
          borderColor: TOKENS.color.surface.border,
          boxShadow: ring,
          transition: 'box-shadow 220ms cubic-bezier(0.25,0.1,0.25,1), transform 180ms'
        }}
      >
        {/* inner pulse */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background:
              voice.enabled
                ? 'radial-gradient(60% 60% at 50% 50%, rgba(6,182,212,.35), rgba(59,130,246,.18) 40%, rgba(0,0,0,0) 70%)'
                : 'radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,.20), rgba(6,182,212,.1) 40%, rgba(0,0,0,0) 70%)',
            filter: 'blur(0.2px)'
          }}
        />
      </button>

      {/* Quick intents row (click text = simulate "voice") */}
      <div className="mt-2 flex gap-6 justify-center text-xs">
        <button
          onClick={() => handleIntent('boost')}
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ color: TOKENS.color.text.secondary }}
          disabled={busy}
        >
          boost
        </button>
        <button
          onClick={() => handleIntent('quote')}
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ color: TOKENS.color.text.secondary }}
          disabled={busy}
        >
          quote
        </button>
      </div>
    </div>
  );
}

