'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { ActionDrawer } from '@/components/cognitive/ActionDrawer';
import { CognitiveHeader } from '@/components/cognitive/CognitiveHeader';
import { VoiceOrb } from '@/components/cognitive/VoiceOrb';
import { AutopilotMode } from '@/components/cognitive/modes/AutopilotMode';
import { DriveMode } from '@/components/cognitive/modes/DriveMode';
import { InsightsMode } from '@/components/cognitive/modes/InsightsMode';
import { useCognitiveStore } from '@/lib/store/cognitive';

export function CognitiveDashboard() {
  const { mode, drawerOpen, closeDrawer } = useCognitiveStore();

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-neural-950 via-black to-neural-900 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />

      <CognitiveHeader />

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'drive' && (
            <motion.div
              key="drive"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <DriveMode />
            </motion.div>
          )}

          {mode === 'autopilot' && (
            <motion.div
              key="autopilot"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <AutopilotMode />
            </motion.div>
          )}

          {mode === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <InsightsMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <VoiceOrb />
      <ActionDrawer open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
