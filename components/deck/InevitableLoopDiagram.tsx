'use client';

import { motion } from 'framer-motion';
import { TOKENS } from '@/styles/design-tokens';
import type { LoopStage } from '@/lib/architecture/loop';

const LOOP_STAGES: { stage: LoopStage; icon: string; color: string; description: string }[] = [
  { stage: 'sense', icon: '👁️', color: TOKENS.color.accent.clarityBlue, description: 'Detect anomalies' },
  { stage: 'predict', icon: '🔮', color: TOKENS.color.accent.clarityCyan, description: 'Generate foresight' },
  { stage: 'act', icon: '⚡', color: TOKENS.color.accent.emerald, description: 'Auto-fix or suggest' },
  { stage: 'learn', icon: '🧠', color: TOKENS.color.accent.amber, description: 'Retrain logic' },
  { stage: 'reveal', icon: '💬', color: '#7c3aed', description: 'Narrate insight' },
  { stage: 'dissolve', icon: '✨', color: TOKENS.color.text.muted, description: 'Fade until needed' }
];

export default function InevitableLoopDiagram() {
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Center core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 3, repeat: -1, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full"
          style={{
            background: `radial-gradient(circle, ${TOKENS.color.accent.clarityBlue}40, transparent)`,
            boxShadow: `0 0 60px ${TOKENS.color.accent.clarityBlue}60`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-mono mb-1" style={{ color: TOKENS.color.text.secondary }}>
              INEVITABLE
            </div>
            <div className="text-2xl font-bold" style={{ color: TOKENS.color.text.primary }}>
              LOOP
            </div>
          </div>
        </div>
      </div>

      {/* Loop stages in circle */}
      {LOOP_STAGES.map((item, index) => {
        const angle = (index / LOOP_STAGES.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 160;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={item.stage}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative cursor-pointer"
            >
              {/* Connecting line */}
              <svg
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`,
                  transformOrigin: 'center',
                  width: `${radius}px`,
                  height: '2px',
                  pointerEvents: 'none'
                }}
              >
                <line
                  x1="0"
                  y1="1"
                  x2={radius}
                  y2="1"
                  stroke={item.color}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              </svg>

              {/* Stage node */}
              <div
                className="w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center relative"
                style={{
                  background: `${TOKENS.color.surface.panel}`,
                  borderColor: item.color,
                  boxShadow: `0 4px 12px ${item.color}40`
                }}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-mono uppercase" style={{ color: item.color }}>
                  {item.stage}
                </div>
              </div>

              {/* Description tooltip */}
              <div
                className="absolute top-full mt-2 px-3 py-1 rounded-lg whitespace-nowrap text-xs text-center"
                style={{
                  background: TOKENS.color.surface.glass,
                  color: TOKENS.color.text.secondary,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              >
                {item.description}
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Rotation animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: -1, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px dashed ${TOKENS.color.surface.border}`,
            margin: '64px'
          }}
        />
      </motion.div>
    </div>
  );
}
