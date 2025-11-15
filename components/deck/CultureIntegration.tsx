'use client';

import { motion } from 'framer-motion';
import { TOKENS } from '@/styles/design-tokens';
import { CULTURE_METRICS } from '@/lib/architecture/loop';

export default function CultureIntegration() {
  return (
    <div className="space-y-4">
      {CULTURE_METRICS.map((metric, index) => {
        const progress = metric.current_score ? (metric.current_score / metric.target_threshold) * 100 : 0;
        const isOnTarget = progress >= 90;
        const isWarning = progress >= 70 && progress < 90;

        return (
          <motion.div
            key={metric.principle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl border"
            style={{ background: TOKENS.color.surface.panel, borderColor: TOKENS.color.surface.border }}
          >
            {/* Principle */}
            <div className="mb-3">
              <div className="text-xs font-mono mb-1" style={{ color: TOKENS.color.text.muted }}>PRINCIPLE</div>
              <div className="text-base font-semibold" style={{ color: TOKENS.color.text.primary }}>
                "{metric.principle}"
              </div>
            </div>

            {/* Measurement */}
            <div className="mb-3">
              <div className="text-xs font-mono mb-1" style={{ color: TOKENS.color.text.muted }}>MEASUREMENT</div>
              <div className="text-sm" style={{ color: TOKENS.color.text.secondary }}>
                {metric.measurement}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: TOKENS.color.text.secondary }}>Current</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: isOnTarget ? TOKENS.color.accent.emerald : isWarning ? TOKENS.color.accent.risk : TOKENS.color.accent.alert }}>
                    {metric.current_score}
                  </span>
                  <span style={{ color: TOKENS.color.text.muted }}>/ {metric.target_threshold}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: TOKENS.color.surface.border }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: isOnTarget
                      ? `linear-gradient(90deg, ${TOKENS.color.accent.emerald}, ${TOKENS.color.accent.clarityCyan})`
                      : isWarning
                      ? TOKENS.color.accent.risk
                      : TOKENS.color.accent.alert
                  }}
                />
              </div>

              <div className="text-xs text-right" style={{ color: TOKENS.color.text.muted }}>
                {progress.toFixed(0)}% to target
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Overall status */}
      <div className="mt-6 p-5 rounded-xl text-center" style={{ background: `${TOKENS.color.accent.clarityBlue}10`, border: `1px solid ${TOKENS.color.accent.clarityBlue}30` }}>
        <div className="text-sm font-mono mb-2" style={{ color: TOKENS.color.text.secondary }}>
          CULTURAL INTEGRATION STATUS
        </div>
        <div className="text-3xl font-bold" style={{ color: TOKENS.color.accent.clarityBlue }}>
          {Math.round(CULTURE_METRICS.reduce((sum, m) => sum + (m.current_score || 0) / m.target_threshold, 0) / CULTURE_METRICS.length * 100)}%
        </div>
        <div className="text-xs mt-1" style={{ color: TOKENS.color.text.muted }}>
          Doctrine embedded across {CULTURE_METRICS.length} principles
        </div>
      </div>
    </div>
  );
}
