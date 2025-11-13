'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAIIntroVariant, trackAIIntroEvent, AI_INTRO_VARIANTS, type AIIntroVariant } from '@/lib/ab/ai-intro-variants';

type AIIntroCardProps = {
  domain: string;
  currentIntro: string;
  improvedIntro: string;
  onUnlockDashboard: () => void;
};

export function AIIntroCard({
  domain,
  currentIntro,
  improvedIntro,
  onUnlockDashboard
}: AIIntroCardProps) {
  const [variant, setVariant] = useState<AIIntroVariant>('A');

  useEffect(() => {
    const v = getAIIntroVariant();
    setVariant(v);
    trackAIIntroEvent('view', v, domain);
  }, [domain]);

  const config = AI_INTRO_VARIANTS[variant];

  const handleUnlock = () => {
    trackAIIntroEvent('click_unlock', variant, domain);
    onUnlockDashboard();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-8 w-full max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
    >
      <div className="text-xs uppercase tracking-[0.16em] text-white/50">
        How AI sees you today
      </div>
      <div className="mt-1 text-sm text-white/70 truncate">
        {domain}
      </div>

      <h2 className="mt-4 text-sm font-semibold text-white">
        {config.copy.title}
      </h2>

      {variant === 'C' ? (
        // Variant C: Show improved first, then current
        <>
          <p className="mt-2 text-sm text-emerald-300 leading-relaxed">
            "{improvedIntro}"
          </p>
          <p className="mt-4 text-xs text-white/60">
            {config.copy.bridgeText}
          </p>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            "{currentIntro}"
          </p>
        </>
      ) : (
        // Variants A & B: Show current first, then improved
        <>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            "{currentIntro}"
          </p>
          {variant === 'B' && (
            <p className="mt-3 text-xs text-red-300/80">
              {config.copy.bridgeText}
            </p>
          )}
          {variant === 'A' && (
            <p className="mt-4 text-xs text-white/60">
              {config.copy.bridgeText}
            </p>
          )}
          <p className="mt-1 text-sm text-emerald-300 leading-relaxed">
            "{improvedIntro}"
          </p>
        </>
      )}

      <button
        onClick={handleUnlock}
        className="mt-6 h-10 w-full rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-100 transition"
      >
        {config.copy.cta}
      </button>

      <p className="mt-1 text-[11px] text-white/40 text-center">
        {config.copy.subtext}
      </p>
    </motion.section>
  );
}
