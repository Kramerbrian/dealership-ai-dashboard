'use client';

import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  metrics?: {
    vai?: number;
    piqr?: number;
    qai?: number;
    hrp?: number;
  };
  brandTint: string;
}

export default function MotionOrchestrator({
  children,
  metrics,
  brandTint,
}: Props) {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start({
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [controls]);

  return (
    <motion.div
      animate={controls}
      className="relative"
      style={{
        background: `linear-gradient(135deg, ${brandTint}05 0%, transparent 100%)`,
      }}
    >
      {children}

      {/* Animated metric indicators */}
      {metrics && (
        <div className="absolute top-4 right-4 flex gap-2">
          {Object.entries(metrics).map(([key, value], idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
              style={{
                background: `${brandTint}20`,
                color: brandTint,
                border: `1px solid ${brandTint}40`,
              }}
            >
              {key.toUpperCase()}: {value}
              {key !== 'hrp' && '%'}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

