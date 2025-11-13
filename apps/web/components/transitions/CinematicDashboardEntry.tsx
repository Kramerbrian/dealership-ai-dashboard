'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, Zap, Activity } from 'lucide-react';

interface CinematicDashboardEntryProps {
  onComplete: () => void;
  dealerName?: string;
}

export default function CinematicDashboardEntry({
  onComplete,
  dealerName = 'Your Dealership',
}: CinematicDashboardEntryProps) {
  const [stage, setStage] = useState<'loading' | 'system-ack' | 'orchestrator' | 'pulse' | 'complete'>('loading');

  useEffect(() => {
    const sequence = async () => {
      // Loading stage
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStage('system-ack');

      // System acknowledgment
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStage('orchestrator');

      // Orchestrator ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStage('pulse');

      // Pulse assimilation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStage('complete');

      // Complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete();
    };

    sequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Radial gradient orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            />
            <h2 className="text-3xl font-bold text-white mb-2">Initializing...</h2>
            <p className="text-blue-300">Preparing your AI intelligence dashboard</p>
          </motion.div>
        )}

        {stage === 'system-ack' && (
          <motion.div
            key="system-ack"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-4"
            >
              System Acknowledged
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-blue-300"
            >
              Welcome to {dealerName}
            </motion.p>
            <motion.div
              className="mt-6 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {stage === 'orchestrator' && (
          <motion.div
            key="orchestrator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1, rotate: { repeat: Infinity, duration: 3, ease: 'linear' } }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50"
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              Orchestrator Ready
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-purple-300"
            >
              AI intelligence systems online
            </motion.p>
          </motion.div>
        )}

        {stage === 'pulse' && (
          <motion.div
            key="pulse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="text-center z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 60px rgba(59, 130, 246, 0.8)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center"
            >
              <Activity className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4"
            >
              Pulse Assimilation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-cyan-300"
            >
              Synchronizing real-time data streams
            </motion.p>
            <motion.div
              className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {['ChatGPT', 'Claude', 'Gemini'].map((platform, i) => (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-500/30 text-blue-300 text-sm"
                >
                  {platform}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50"
            >
              <motion.svg
                className="w-16 h-16 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <path d="M20 6L9 17l-5-5" />
              </motion.svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold text-white mb-4"
            >
              Ready!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-green-300"
            >
              Launching your dashboard...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
