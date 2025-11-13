'use client';

import { usePrefsStore } from '@/lib/store/prefs';
import { X } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

export function SettingsModal() {
  const { openSettings, setOpenSettings, agentEnabled, setAgentEnabled, pgOnly, avoidTopics } =
    usePrefsStore();

  if (!openSettings) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={() => setOpenSettings(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: TOKENS.color.surface.panel,
          borderColor: TOKENS.color.surface.border,
          boxShadow: TOKENS.shadow.soft,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: TOKENS.color.text.primary }}
          >
            Settings
          </h2>
          <button
            onClick={() => setOpenSettings(false)}
            className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
            style={{ color: TOKENS.color.text.secondary }}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Easter Eggs Toggle */}
        <div className="mb-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agentEnabled}
              onChange={(e) => setAgentEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded"
              style={{ accentColor: TOKENS.color.cognitive.blue }}
            />
            <div className="flex-1">
              <div
                className="mb-1 text-sm font-medium"
                style={{ color: TOKENS.color.text.primary }}
              >
                Enable PG Easter Eggs
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: TOKENS.color.text.secondary }}
              >
                Voice Orb will occasionally show motivational quotes from pop culture (Yoda,
                Wayne Gretzky, etc.). All quotes are PG-rated and work-appropriate.
              </p>
            </div>
          </label>
        </div>

        {/* Guardrails Display */}
        <div
          className="rounded-lg border p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: TOKENS.color.surface.border,
          }}
        >
          <div
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: TOKENS.color.text.secondary }}
          >
            Content Guardrails
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: TOKENS.color.cognitive.cyan }}
              />
              <span style={{ color: TOKENS.color.text.primary }}>
                PG-only content: {pgOnly ? 'Enforced' : 'Off'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: TOKENS.color.cognitive.cyan }}
              />
              <span style={{ color: TOKENS.color.text.primary }}>
                Topics avoided: {avoidTopics.join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: TOKENS.color.cognitive.cyan }}
              />
              <span style={{ color: TOKENS.color.text.primary }}>
                Scarcity gating: ≤10% show rate
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: TOKENS.color.text.secondary }}>
            Preferences saved to localStorage. No PII collected.
          </p>
        </div>
      </div>
    </div>
  );
}
