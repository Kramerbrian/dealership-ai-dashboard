'use client';

import { motion } from 'framer-motion';
import { TOKENS } from '@/lib/design-tokens';
import { DEPLOYMENT_ROADMAP } from '@/lib/architecture/loop';
import { CheckCircle2, Circle } from 'lucide-react';

export default function DeploymentRoadmap() {
  return (
    <div className="space-y-6">
      {DEPLOYMENT_ROADMAP.map((phase, index) => (
        <motion.div
          key={phase.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 }}
          className="relative"
        >
          {/* Timeline connector */}
          {index < DEPLOYMENT_ROADMAP.length - 1 && (
            <div
              className="absolute left-6 top-16 w-0.5 h-full"
              style={{ background: `linear-gradient(to bottom, ${TOKENS.color.accent.clarityBlue}80, ${TOKENS.color.surface.border})` }}
            />
          )}

          <div className="flex gap-4">
            {/* Phase indicator */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg"
                style={{
                  background: TOKENS.color.surface.panel,
                  borderColor: TOKENS.color.accent.clarityBlue,
                  color: TOKENS.color.accent.clarityBlue,
                  boxShadow: `0 4px 12px ${TOKENS.color.accent.clarityBlue}40`
                }}
              >
                {phase.name[0]}
              </div>
            </div>

            {/* Phase content */}
            <div className="flex-1 pb-6">
              <div className="rounded-xl p-5 border" style={{ background: TOKENS.color.surface.panel, borderColor: TOKENS.color.surface.border }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-mono mb-1" style={{ color: TOKENS.color.text.secondary }}>
                      PHASE {index + 1}
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ color: TOKENS.color.text.primary }}>
                      {phase.name}
                    </div>
                    <div className="text-sm" style={{ color: TOKENS.color.accent.clarityBlue }}>
                      {phase.focus}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: TOKENS.color.surface.glass, color: TOKENS.color.text.secondary }}>
                    {phase.duration_weeks}w
                  </div>
                </div>

                <div className="mb-4 p-3 rounded-lg" style={{ background: `${TOKENS.color.accent.emerald}15` }}>
                  <div className="text-xs font-mono mb-1" style={{ color: TOKENS.color.text.muted }}>OUTCOME</div>
                  <div className="text-sm font-semibold" style={{ color: TOKENS.color.accent.emerald }}>
                    {phase.outcome}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono mb-2" style={{ color: TOKENS.color.text.muted }}>MILESTONES</div>
                  {phase.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: TOKENS.color.accent.emerald }} />
                      <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                        {milestone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
