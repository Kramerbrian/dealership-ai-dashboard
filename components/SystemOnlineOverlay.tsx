'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SystemOnlineOverlay (Brand-Tinted)
 * --------------------------------------------------
 * Short 1s acknowledgment for returning users.
 * Pulls a deterministic accent color from dealer domain or favicon.
 */

interface Props {
  userName?: string;
  dealer?: string;            // e.g. "naplesautogroup.com"
  durationMs?: number;
}

export default function SystemOnlineOverlay({
  userName = 'Dealer',
  dealer = 'your dealership',
  durationMs = 1200,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(id);
  }, [durationMs]);

  // ───────────────────────────────────────────────
  // Deterministic brand-tint generator
  const hue = useMemo(() => {
    if (!dealer) return 195; // cyan default
    const str = dealer.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
    return hash % 360;
  }, [dealer]);

  const accent = `hsl(${hue}, 80%, 55%)`;
  const accentSoft = `hsl(${hue}, 80%, 70%)`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="system-online"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black text-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle brand grid */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accent}20, transparent 80%)`,
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Brand-tinted pulse */}
          <motion.div
            className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: `${accentSoft}50` }}
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: [0.8, 1.25, 1], opacity: [0.4, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <motion.span
              className="text-sm tracking-widest uppercase"
              style={{ color: accentSoft }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2 }}
            >
              System Online
            </motion.span>
          </motion.div>

          {/* Brand pulse line */}
          <motion.div
            className="absolute w-[160%] h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentSoft}90, transparent)`,
            }}
            animate={{ scaleX: [0, 1.4, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Audio ping */}
          <audio autoPlay>
            <source src="/sounds/system_online.mp3" type="audio/mpeg" />
          </audio>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
