'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  brandTint: string;
}

export default function SystemOnlineOverlay({ brandTint }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `radial-gradient(circle, ${brandTint}10 0%, #000 100%)`,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0.8, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-32 h-32 mx-auto mb-8 rounded-full border-4"
          style={{
            borderColor: brandTint,
            boxShadow: `0 0 40px ${brandTint}80`,
          }}
          animate={{
            scale: pulse ? 1.1 : 1,
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 1, repeat: Infinity, repeatType: 'reverse' },
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${brandTint}40 0%, transparent 70%)`,
            }}
          />
        </motion.div>

        <motion.h1
          className="text-5xl font-bold mb-4"
          style={{ color: brandTint }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          SYSTEM ONLINE
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Orchestrator 3.0 ready
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

