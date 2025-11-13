'use client';

import { useState } from 'react';
import { TOKENS } from '@/lib/design-tokens';
import { DEFAULT_SPEC } from '@/lib/architecture/loop';
import { motion } from 'framer-motion';

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
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
      <div className="p-4 border-b" style={{ borderColor: TOKENS.color.surface.border }}>
        <div style={{ fontFamily: TOKENS.font.family.sans, fontSize: TOKENS.font.size.lg, color: TOKENS.color.text.primary }}>
          {title}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function TokenSwatches() {
  const c = TOKENS.color;
  const cell = (name: string, val: string) => (
    <div className="rounded-xl p-4 border" style={{ background: val, borderColor: TOKENS.color.surface.border }}>
      <div style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)', fontSize: TOKENS.font.size.sm }}>{name}</div>
      <div className="text-xs opacity-80" style={{ color: '#fff', fontFamily: TOKENS.font.family.mono }}>{val}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cell('Graphite', c.surface.graphite)}
      {cell('Panel', c.surface.panel)}
      {cell('Border', c.surface.border)}
      {cell('Glass', c.surface.glass)}
      {cell('Clarity Blue', c.accent.clarityBlue)}
      {cell('Clarity Cyan', c.accent.clarityCyan)}
      {cell('Emerald', c.accent.emerald)}
      {cell('Amber', c.accent.amber)}
      {cell('Critical', c.accent.critical)}
    </div>
  );
}

function PersonaMatrix() {
  const personas = TOKENS.persona as any;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Object.keys(personas).map((k) => {
        const p = personas[k];
        return (
          <motion.div
            key={k}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-4 border cursor-pointer"
            style={{ borderColor: TOKENS.color.surface.border, background: TOKENS.color.surface.panel }}>
            <div className="text-sm font-mono" style={{ color: TOKENS.color.text.secondary }}>{k.toUpperCase()}</div>
            <div className="text-lg font-semibold mt-2" style={{ color: TOKENS.color.text.primary }}>{p.tone}</div>
            <div className="mt-2 text-xs" style={{ color: TOKENS.color.text.muted }}>Motion: {p.motion}</div>
            <div className="mt-3 h-2 rounded-full" style={{ background: p.color.value }} />
          </motion.div>
        );
      })}
    </div>
  );
}

function GovernanceView() {
  const g = DEFAULT_SPEC.governance;
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-mono mb-1" style={{ color: TOKENS.color.text.secondary }}>Clarity Protocol</div>
        <div className="text-2xl font-bold" style={{ color: TOKENS.color.text.primary }}>{g.clarity_protocol.toUpperCase()}</div>
      </div>
      <div>
        <div className="text-sm font-mono mb-1" style={{ color: TOKENS.color.text.secondary }}>Zero Fracture</div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${g.zero_fracture ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <div className="text-lg font-semibold" style={{ color: TOKENS.color.text.primary }}>
            {g.zero_fracture ? 'ENABLED' : 'DISABLED'}
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm font-mono mb-2" style={{ color: TOKENS.color.text.secondary }}>Identity Domains</div>
        <div className="flex flex-wrap gap-2">
          {g.identity_domains.map((d) => (
            <div key={d} className="px-3 py-1 rounded-full text-sm" style={{ background: TOKENS.color.surface.glass, color: TOKENS.color.text.primary }}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeshView() {
  return (
    <div className="space-y-3">
      {DEFAULT_SPEC.mesh.map((n) => (
        <motion.div
          key={n.id}
          whileHover={{ x: 4 }}
          className="rounded-xl p-4 border"
          style={{ borderColor: TOKENS.color.surface.border, background: TOKENS.color.surface.panel }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-mono" style={{ color: TOKENS.color.text.secondary }}>{n.region}</div>
              <div className="text-lg font-semibold" style={{ color: TOKENS.color.text.primary }}>{n.id}</div>
            </div>
            <div className="text-2xl">📍</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: TOKENS.color.text.muted }}>Trust</div>
              <div className="text-lg font-bold" style={{ color: TOKENS.color.accent.clarityBlue }}>
                {(n.weights.trust*100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: TOKENS.color.text.muted }}>Visibility</div>
              <div className="text-lg font-bold" style={{ color: TOKENS.color.accent.clarityCyan }}>
                {(n.weights.visibility*100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: TOKENS.color.text.muted }}>Ops</div>
              <div className="text-lg font-bold" style={{ color: TOKENS.color.accent.emerald }}>
                {(n.weights.ops*100).toFixed(0)}%
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SelfHealingView() {
  const sh = DEFAULT_SPEC.self_healing;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: TOKENS.color.surface.glass }}>
        <span style={{ color: TOKENS.color.text.secondary }}>Schema Autofix</span>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${sh.schema_autofix ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {sh.schema_autofix ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: TOKENS.color.surface.glass }}>
        <span style={{ color: TOKENS.color.text.secondary }}>Latency Reroute</span>
        <span className="font-mono text-lg" style={{ color: TOKENS.color.text.primary }}>{sh.latency_reroute_ms}ms</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: TOKENS.color.surface.glass }}>
        <span style={{ color: TOKENS.color.text.secondary }}>Threshold Adaptivity</span>
        <span className="font-mono text-lg uppercase" style={{ color: TOKENS.color.text.primary }}>{sh.threshold_adaptivity}</span>
      </div>
    </div>
  );
}

function MarketConsciousnessView() {
  const mc = DEFAULT_SPEC.market_consciousness;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${TOKENS.color.accent.clarityBlue}15, ${TOKENS.color.accent.clarityCyan}15)` }}>
        <div className="text-sm mb-2" style={{ color: TOKENS.color.text.secondary }}>Market Map Status</div>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full animate-pulse ${mc.map_enabled ? 'bg-emerald-400' : 'bg-gray-400'}`} />
          <span className="text-lg font-semibold" style={{ color: TOKENS.color.text.primary }}>
            {mc.map_enabled ? 'SCANNING' : 'PAUSED'}
          </span>
        </div>
      </div>
      <div className="p-4 rounded-lg" style={{ background: TOKENS.color.surface.glass }}>
        <div className="text-sm mb-2" style={{ color: TOKENS.color.text.secondary }}>Forecast Window</div>
        <div className="text-3xl font-bold" style={{ color: TOKENS.color.text.primary }}>
          {mc.forecast_hours}<span className="text-lg ml-2" style={{ color: TOKENS.color.text.muted }}>hours</span>
        </div>
      </div>
    </div>
  );
}

export default function InevitabilityDeck() {
  const [mode, setMode] = useState<'design'|'code'>('design');

  return (
    <div className="min-h-screen" style={{ background: TOKENS.color.surface.graphite }}>
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide font-mono mb-1" style={{ color: TOKENS.color.text.muted }}>
              {TOKENS.meta.brand} • {TOKENS.meta.name}
            </div>
            <div className="text-4xl font-bold" style={{ color: TOKENS.color.text.primary, fontFamily: TOKENS.font.family.sans }}>
              Inevitability Spec
            </div>
            <div className="text-sm mt-2" style={{ color: TOKENS.color.text.secondary }}>
              Doctrine: {TOKENS.meta.doctrine.clarity} / {TOKENS.meta.doctrine.trust}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('design')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold border transition-all ${mode==='design'?'':'opacity-70'}`}
              style={{
                borderColor: TOKENS.color.surface.border,
                background: mode==='design' ? `linear-gradient(90deg, ${TOKENS.color.accent.clarityBlue}, ${TOKENS.color.accent.clarityCyan})` : TOKENS.color.surface.panel,
                color: mode==='design' ? '#fff' : TOKENS.color.text.secondary,
                boxShadow: mode==='design' ? TOKENS.shadow.glowBlue : 'none'
              }}>
              🎨 Design
            </button>
            <button
              onClick={() => setMode('code')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold border transition-all ${mode==='code'?'':'opacity-70'}`}
              style={{
                borderColor: TOKENS.color.surface.border,
                background: mode==='code' ? TOKENS.color.surface.panel : 'transparent',
                color: TOKENS.color.text.secondary,
                fontFamily: TOKENS.font.family.mono
              }}>
              {'</>'} Code
            </button>
          </div>
        </div>

        {/* Frames */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Neural Glass • Design Tokens">
            {mode==='design' ? <TokenSwatches/> : (
              <pre className="text-xs overflow-auto max-h-96" style={{ color: TOKENS.color.text.secondary, fontFamily: TOKENS.font.family.mono }}>
                {JSON.stringify(TOKENS, null, 2)}
              </pre>
            )}
          </Panel>
          <Panel title="Agent Persona Matrix">
            <PersonaMatrix/>
          </Panel>
          <Panel title="Governance Protocol">
            <GovernanceView/>
          </Panel>
          <Panel title="Cognition Mesh">
            <MeshView/>
          </Panel>
          <Panel title="Self-Healing UX">
            <SelfHealingView/>
          </Panel>
          <Panel title="Market Consciousness">
            <MarketConsciousnessView/>
          </Panel>
        </div>

        {/* Footer */}
        <div className="text-center text-xs opacity-60 mt-8 pb-8" style={{ color: TOKENS.color.text.muted, fontFamily: TOKENS.font.family.mono }}>
          v{TOKENS.meta.version} • Updated {TOKENS.meta.updated} • Single source of truth for Figma + Cursor
        </div>
      </div>
    </div>
  );
}
