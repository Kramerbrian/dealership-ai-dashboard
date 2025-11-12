'use client';

/**
 * CognitiveOrb - Always-On Orbital Assistant
 * Customer-facing and internal modes with VIN-verified responses
 */

import React, { useState, useEffect } from 'react';
import { useHudStore } from '@/lib/store/hud';
import { TOKENS } from '@/styles/design-tokens';

interface CognitiveOrbProps {
  mode: 'customer' | 'internal';
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
}

export function CognitiveOrb({ mode = 'internal', position = 'bottom-right' }: CognitiveOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addPulse } = useHudStore();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4'
  };

  const handleQuery = async (input: string) => {
    if (!input.trim()) return;

    setLoading(true);
    setQuery(input);

    try {
      // Route to appropriate API based on mode
      const endpoint = mode === 'customer' 
        ? '/api/orb/customer-query'
        : '/api/orb/internal-query';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, mode })
      });

      const data = await res.json();
      setResponse(data.response || data.message);

      // Add pulse event for internal mode
      if (mode === 'internal') {
        addPulse({
          level: 'low',
          title: 'Orb query',
          detail: input,
          delta: 'query'
        });
      }
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Orb Visual */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full border flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
        style={{
          background: TOKENS.color.surface.panel,
          borderColor: TOKENS.color.surface.border,
          boxShadow: TOKENS.shadow.soft
        }}
        aria-label="Open cognitive assistant"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse" />
        {mode === 'internal' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
        )}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 rounded-2xl border overflow-hidden"
          style={{
            background: TOKENS.color.surface.panel,
            borderColor: TOKENS.color.surface.border,
            boxShadow: TOKENS.shadow.soft,
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: TOKENS.color.surface.border }}>
            <div className="text-sm font-semibold" style={{ color: TOKENS.color.text.primary }}>
              {mode === 'customer' ? 'How can I help?' : 'Cognitive Assistant'}
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {response && (
              <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                {response}
              </div>
            )}

            {mode === 'internal' && (
              <div className="text-xs space-y-1" style={{ color: TOKENS.color.text.muted }}>
                <div>Try: /today's ACV delta</div>
                <div>Try: /open ROs</div>
                <div>Try: /pulse</div>
              </div>
            )}
          </div>

          <div className="p-4 border-t" style={{ borderColor: TOKENS.color.surface.border }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery(query)}
                placeholder={mode === 'customer' ? 'Ask about availability...' : 'Type a command...'}
                className="flex-1 px-3 py-2 rounded-lg bg-transparent border text-sm"
                style={{
                  borderColor: TOKENS.color.surface.border,
                  color: TOKENS.color.text.primary
                }}
              />
              <button
                onClick={() => handleQuery(query)}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: TOKENS.color.accent.blue,
                  color: '#fff'
                }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

