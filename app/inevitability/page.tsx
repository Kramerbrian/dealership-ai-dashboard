'use client';

import { useState } from 'react';
import { TOKENS } from '@/styles/design-tokens';
import { DEFAULT_SPEC } from '@/lib/architecture/loop';
import { motion } from 'framer-motion';
import InevitableLoopDiagram from '@/components/deck/InevitableLoopDiagram';
import DeploymentRoadmap from '@/components/deck/DeploymentRoadmap';
import CultureIntegration from '@/components/deck/CultureIntegration';

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border"
      style={{
        background: TOKENS.color.surface.panel,
        borderColor: TOKENS.color.surface.border,
        boxShadow: TOKENS.shadow.soft,
        backdropFilter: `blur(${TOKENS.blur.backdrop})`,
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: TOKENS.color.surface.border }}>
        <div style={{ fontFamily: TOKENS.font.family.sans, fontSize: TOKENS.font.size.xl, fontWeight: 700, color: TOKENS.color.text.primary }}>
          {title}
        </div>
        {subtitle && (
          <div className="mt-1 text-sm" style={{ color: TOKENS.color.text.secondary }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

export default function InevitabilityDeck() {
  const [activeSection, setActiveSection] = useState<'overview' | 'technical' | 'deployment'>('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: '🎯' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'deployment', label: 'Deployment', icon: '🚀' }
  ];

  return (
    <div className="min-h-screen" style={{ background: TOKENS.color.surface.graphite }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: TOKENS.color.surface.border, background: TOKENS.color.surface.panel }}>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide font-mono mb-2" style={{ color: TOKENS.color.text.muted }}>
                {TOKENS.meta.brand}
              </div>
              <h1 className="text-5xl font-bold mb-3" style={{ color: TOKENS.color.text.primary, fontFamily: TOKENS.font.family.sans }}>
                Inevitability Spec
              </h1>
              <p className="text-lg" style={{ color: TOKENS.color.text.secondary }}>
                From Platform → Nervous System of Dealership Operations
              </p>
              <div className="mt-3 flex gap-3 text-sm">
                <div className="px-3 py-1 rounded-full" style={{ background: TOKENS.color.surface.glass, color: TOKENS.color.accent.clarityBlue }}>
                  Doctrine: {TOKENS.meta.doctrine.clarity}
                </div>
                <div className="px-3 py-1 rounded-full" style={{ background: TOKENS.color.surface.glass, color: TOKENS.color.accent.clarityCyan }}>
                  Trust: {TOKENS.meta.doctrine.trust}
                </div>
              </div>
            </div>
            <div className="text-6xl">🧠</div>
          </div>

          {/* Section Nav */}
          <div className="flex gap-2 mt-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === section.id ? '' : 'opacity-60'
                }`}
                style={{
                  background: activeSection === section.id
                    ? `linear-gradient(90deg, ${TOKENS.color.accent.clarityBlue}, ${TOKENS.color.accent.clarityCyan})`
                    : TOKENS.color.surface.glass,
                  color: '#fff',
                  boxShadow: activeSection === section.id ? TOKENS.shadow.glowBlue : 'none'
                }}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <Panel title="The Inevitable Loop" subtitle="Perpetual cognition cycle: Sense → Predict → Act → Learn → Reveal → Dissolve">
              <InevitableLoopDiagram />
              <div className="mt-6 p-4 rounded-lg text-center" style={{ background: TOKENS.color.surface.glass }}>
                <div className="text-sm mb-2" style={{ color: TOKENS.color.text.secondary }}>
                  Each loop shortens over time until system latency ≈ human instinct
                </div>
              </div>
            </Panel>

            <Panel title="Governance Protocol" subtitle="Clarity as infrastructure, not aspiration">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl" style={{ background: `${TOKENS.color.accent.clarityBlue}15` }}>
                  <div className="text-3xl mb-2">📐</div>
                  <div className="text-lg font-semibold mb-2" style={{ color: TOKENS.color.text.primary }}>
                    Clarity = Truth
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    Every metric must exist within the cognitive layer. If it isn't visible here, it isn't real.
                  </div>
                </div>

                <div className="p-5 rounded-xl" style={{ background: `${TOKENS.color.accent.emerald}15` }}>
                  <div className="text-3xl mb-2">🔗</div>
                  <div className="text-lg font-semibold mb-2" style={{ color: TOKENS.color.text.primary }}>
                    Zero Fracture
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    One identity links CRM, DMS, inventory, reviews, ads. No re-entry, no silos.
                  </div>
                </div>

                <div className="p-5 rounded-xl" style={{ background: `${TOKENS.color.accent.amber}15` }}>
                  <div className="text-3xl mb-2">👤</div>
                  <div className="text-lg font-semibold mb-2" style={{ color: TOKENS.color.text.primary }}>
                    Best End User™
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    Embedded in every workflow. Replace belief with math.
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Cultural Integration" subtitle="Technology → Behavior → Belief">
              <CultureIntegration />
            </Panel>
          </div>
        )}

        {activeSection === 'technical' && (
          <div className="space-y-6">
            <Panel title="Self-Healing Interface" subtitle="UX that repairs itself continuously">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: TOKENS.color.surface.glass }}>
                  <div className="text-2xl">🔧</div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1" style={{ color: TOKENS.color.text.primary }}>
                      Schema Validation
                    </div>
                    <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                      Fixes broken JSON-LD and SEO markup silently in real-time
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${DEFAULT_SPEC.self_healing.schema_autofix ? 'bg-emerald-500/20 text-emerald-400' : ''}`}>
                    {DEFAULT_SPEC.self_healing.schema_autofix ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: TOKENS.color.surface.glass }}>
                  <div className="text-2xl">⚡</div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1" style={{ color: TOKENS.color.text.primary }}>
                      Latency Reroute
                    </div>
                    <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                      Re-routes on integration failures without showing errors
                    </div>
                  </div>
                  <div className="font-mono text-lg" style={{ color: TOKENS.color.accent.clarityCyan }}>
                    {DEFAULT_SPEC.self_healing.latency_reroute_ms}ms
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: TOKENS.color.surface.glass }}>
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1" style={{ color: TOKENS.color.text.primary }}>
                      Adaptive Thresholds
                    </div>
                    <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                      UI complexity adjusts by user skill level automatically
                    </div>
                  </div>
                  <div className="font-mono text-sm uppercase" style={{ color: TOKENS.color.text.primary }}>
                    {DEFAULT_SPEC.self_healing.threshold_adaptivity}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Market Consciousness" subtitle="The network feels its own pulse">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, ${TOKENS.color.accent.clarityBlue}20, ${TOKENS.color.accent.clarityCyan}20)` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-mono" style={{ color: TOKENS.color.text.secondary }}>MAP STATUS</div>
                      <div className={`w-3 h-3 rounded-full animate-pulse ${DEFAULT_SPEC.market_consciousness.map_enabled ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                    </div>
                    <div className="text-3xl font-bold" style={{ color: TOKENS.color.text.primary }}>
                      {DEFAULT_SPEC.market_consciousness.map_enabled ? 'SCANNING' : 'PAUSED'}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl" style={{ background: TOKENS.color.surface.glass }}>
                    <div className="text-sm font-mono mb-2" style={{ color: TOKENS.color.text.secondary }}>FORECAST WINDOW</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold" style={{ color: TOKENS.color.accent.clarityCyan }}>
                        {DEFAULT_SPEC.market_consciousness.forecast_hours}
                      </div>
                      <div className="text-lg" style={{ color: TOKENS.color.text.muted }}>hours</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="text-sm mb-4" style={{ color: TOKENS.color.text.secondary }}>
                    Features:
                  </div>
                  <div className="space-y-2 text-sm">
                    {['3D clarity globe with live visibility scores', 'Ripple trails showing action propagation', 'Predictive heatwaves 48h ahead', 'Natural-language market briefing'].map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="text-emerald-400">✓</div>
                        <div style={{ color: TOKENS.color.text.secondary }}>{feature}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {activeSection === 'deployment' && (
          <div className="space-y-6">
            <Panel title="Deployment Roadmap" subtitle="Alpha → Beta → Gamma: From pilot to collective intelligence">
              <DeploymentRoadmap />
            </Panel>

            <Panel title="Success Metrics" subtitle="Inevitability achieved when these thresholds are met">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl text-center" style={{ background: `${TOKENS.color.accent.emerald}10` }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: TOKENS.color.accent.emerald }}>
                    &gt;85%
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    Predictive Accuracy
                  </div>
                </div>
                <div className="p-5 rounded-xl text-center" style={{ background: `${TOKENS.color.accent.clarityCyan}10` }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: TOKENS.color.accent.clarityCyan }}>
                    &lt;120ms
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    System Latency
                  </div>
                </div>
                <div className="p-5 rounded-xl text-center" style={{ background: `${TOKENS.color.accent.clarityBlue}10` }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: TOKENS.color.accent.clarityBlue }}>
                    100%
                  </div>
                  <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                    Zero Fracture
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs opacity-60 mt-12 pb-8" style={{ color: TOKENS.color.text.muted, fontFamily: TOKENS.font.family.mono }}>
        v{TOKENS.meta.version} • {TOKENS.meta.updated} • Dual-mode Figma + Cursor • Single source of truth
      </div>
    </div>
  );
}
