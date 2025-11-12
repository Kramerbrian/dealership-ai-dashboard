'use client';

import { usePrefsStore } from '@/lib/store/prefs';
import { TOKENS } from '@/styles/design-tokens';
import { X, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ open, onClose }: PreferencesModalProps) {
  const { agentEnabled, pgOnly, avoidTopics, setAgentEnabled, resetPrefs } = usePrefsStore();

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border overflow-hidden"
          style={{
            background: TOKENS.color.surface.panel,
            borderColor: TOKENS.color.surface.border,
            boxShadow: TOKENS.shadow.soft,
            backdropFilter: `blur(${TOKENS.blur.backdrop})`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: TOKENS.color.surface.border }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: TOKENS.color.text.primary }}>
                Preferences
              </h2>
              <p className="text-sm mt-1" style={{ color: TOKENS.color.text.secondary }}>
                Control your experience
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" style={{ color: TOKENS.color.text.secondary }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {/* Agent Easter Eggs Toggle */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold mb-1" style={{ color: TOKENS.color.text.primary }}>
                    Enable PG Easter Eggs
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    Rare motivational quotes from pop culture (≤10% of interactions). All PG-rated and work-appropriate.
                  </div>
                </div>
                <button
                  onClick={() => setAgentEnabled(!agentEnabled)}
                  className="flex-shrink-0 w-12 h-6 rounded-full transition-colors relative"
                  style={{
                    background: agentEnabled
                      ? `linear-gradient(90deg, ${TOKENS.color.accent.emerald}, ${TOKENS.color.accent.clarityCyan})`
                      : TOKENS.color.surface.border,
                  }}
                  aria-label={agentEnabled ? 'Disable easter eggs' : 'Enable easter eggs'}
                >
                  <motion.div
                    animate={{ x: agentEnabled ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  />
                </button>
              </div>

              {/* Example quotes preview */}
              {agentEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-lg text-sm"
                  style={{ background: `${TOKENS.color.accent.clarityBlue}15`, color: TOKENS.color.text.secondary }}
                >
                  <div className="font-mono text-xs mb-1" style={{ color: TOKENS.color.text.muted }}>EXAMPLES</div>
                  <div className="space-y-1 text-xs">
                    <div>"Do. Or do not. There is no try" — Yoda</div>
                    <div>"Just keep swimming" — Dory</div>
                    <div>"Done is better than perfect" — Sheryl Sandberg</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* PG-Only Mode (Always Enforced) */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold mb-1" style={{ color: TOKENS.color.text.primary }}>
                    PG-Rated Content Only
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    All content is family-friendly and work-appropriate. This setting is always enforced.
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: `${TOKENS.color.accent.emerald}15` }}>
                  <Check className="w-4 h-4" style={{ color: TOKENS.color.accent.emerald }} />
                  <span className="text-sm font-semibold" style={{ color: TOKENS.color.accent.emerald }}>
                    Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Avoided Topics (Read-only) */}
            <div>
              <div className="font-semibold mb-2" style={{ color: TOKENS.color.text.primary }}>
                Avoided Topics
              </div>
              <div className="text-sm mb-3" style={{ color: TOKENS.color.text.secondary }}>
                The system automatically avoids these topics in all interactions:
              </div>
              <div className="flex flex-wrap gap-2">
                {avoidTopics.map((topic) => (
                  <div
                    key={topic}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      background: TOKENS.color.surface.glass,
                      color: TOKENS.color.text.secondary,
                      border: `1px solid ${TOKENS.color.surface.border}`,
                    }}
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: TOKENS.color.surface.border }} />

            {/* Privacy Note */}
            <div className="p-3 rounded-lg text-xs" style={{ background: TOKENS.color.surface.glass, color: TOKENS.color.text.muted }}>
              <div className="font-semibold mb-1">Privacy</div>
              <div>
                Your preferences are stored locally in your browser only. No data is sent to our servers.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: TOKENS.color.surface.border }}>
            <button
              onClick={resetPrefs}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-800"
              style={{ borderColor: TOKENS.color.surface.border, color: TOKENS.color.text.secondary }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: `linear-gradient(90deg, ${TOKENS.color.accent.clarityBlue}, ${TOKENS.color.accent.clarityCyan})`,
                color: '#fff',
              }}
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
