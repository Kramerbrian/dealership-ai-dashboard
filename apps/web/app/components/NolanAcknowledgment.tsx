'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  kpis: any;
  brandTint: string;
}

export default function NolanAcknowledgment({ kpis, brandTint }: Props) {
  const [currentLine, setCurrentLine] = useState(0);

  const lines = [
    'IN A WORLD WHERE AI DECIDES',
    'WHO GETS FOUND...',
    'ONE PLATFORM',
    'HOLDS THE KEY',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % lines.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: `radial-gradient(circle, ${brandTint}05 0%, #000 100%)`,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLine}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 1.1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="text-center"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4"
            style={{ color: brandTint }}
            initial={{ letterSpacing: '0.1em' }}
            animate={{ letterSpacing: '0.2em' }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            {lines[currentLine]}
          </motion.h1>
        </motion.div>
      </AnimatePresence>

      {/* KPI preview fade-in */}
      {currentLine === lines.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-20 left-0 right-0 text-center"
        >
          <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
            {kpis?.kpis && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                >
                  <div className="text-3xl font-bold" style={{ color: brandTint }}>
                    {kpis.kpis.vai}%
                  </div>
                  <div className="text-sm text-gray-400">VAI</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.7, type: 'spring' }}
                >
                  <div className="text-3xl font-bold" style={{ color: brandTint }}>
                    {kpis.kpis.piqr}%
                  </div>
                  <div className="text-sm text-gray-400">PIQR</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.9, type: 'spring' }}
                >
                  <div className="text-3xl font-bold" style={{ color: brandTint }}>
                    {kpis.kpis.qai}%
                  </div>
                  <div className="text-sm text-gray-400">QAI</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.1, type: 'spring' }}
                >
                  <div className="text-3xl font-bold" style={{ color: brandTint }}>
                    {kpis.kpis.hrp}
                  </div>
                  <div className="text-sm text-gray-400">HRP</div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

