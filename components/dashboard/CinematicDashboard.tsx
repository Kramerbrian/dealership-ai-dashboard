/**
 * Cinematic Dashboard - Christopher Nolan Inspired
 * Depth, parallax, time-based transitions, and immersive visual layers
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import OrchestratorView from '@/components/cognitive/OrchestratorView';
import DiagnosticDashboard from '@/components/dashboard/DiagnosticDashboard';
import PulseInbox from '@/components/pulse/PulseInbox';
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';
import { 
  Layers, 
  Zap, 
  TrendingUp, 
  Eye,
  Sparkles,
  Activity
} from 'lucide-react';

interface CinematicDashboardProps {
  dealerId: string;
  domain: string;
}

export default function CinematicDashboard({ dealerId, domain }: CinematicDashboardProps) {
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'overview' | 'pulse' | 'diagnostics'>('overview');

  // Parallax transforms for depth effect
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);
  const foregroundY = useTransform(scrollY, [0, 1000], [0, -100]);
  const pulseY = useTransform(scrollY, [0, 500], [0, -50]);

  useEffect(() => {
    setMounted(true);
    // Cinematic entrance sound (optional)
    // playSound('boot');
  }, []);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1], // Custom easing for cinematic feel
      },
    },
  };

  const depthLayerVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Initializing cognitive interface...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={true}>
      {/* Depth Layer 1: Background Parallax */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 -z-10 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
      </motion.div>

      {/* Depth Layer 2: Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Orchestrator View - Cinematic Entrance */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <OrchestratorView dealerId={dealerId} />
          </motion.div>
        </motion.div>

        {/* Layer Navigation */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center gap-2 p-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <button
            onClick={() => setActiveLayer('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLayer === 'overview'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveLayer('pulse')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeLayer === 'pulse'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Pulse Inbox
          </button>
          <button
            onClick={() => setActiveLayer('diagnostics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLayer === 'diagnostics'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Diagnostics
          </button>
        </motion.div>

        {/* Layer Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeLayer === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              variants={containerVariants}
            >
              {/* Core Metrics Grid - Cinematic Cards */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                {[
                  { label: 'AI Visibility Score', value: '87.3%', color: 'emerald', icon: Eye },
                  { label: 'Competitors Tracked', value: '12', color: 'blue', icon: TrendingUp },
                  { label: 'Monthly Scans', value: '24', color: 'purple', icon: Zap },
                ].map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5,
                      transition: { type: 'spring', stiffness: 400, damping: 25 }
                    }}
                    className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6 relative overflow-hidden group"
                  >
                    {/* Depth glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-500/0 to-${metric.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <metric.icon className={`w-6 h-6 mb-3 text-${metric.color}-400`} />
                    <h2 className="text-lg font-semibold text-white mb-4">{metric.label}</h2>
                    <div className={`text-3xl font-bold text-${metric.color}-400`}>{metric.value}</div>
                    <p className="text-gray-400 mt-2 text-sm">Real-time monitoring active</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Market Intelligence Section */}
              <motion.div
                variants={itemVariants}
                className="mt-8"
              >
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
                >
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  Market Intelligence
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <ZeroClickCard tenantId={dealerId} />
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <AiriCard tenantId={dealerId} />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeLayer === 'pulse' && (
            <motion.div
              key="pulse"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ y: pulseY }}
              className="relative"
            >
              <motion.div
                variants={depthLayerVariants}
                className="bg-gray-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl"
              >
                <PulseInbox />
              </motion.div>
            </motion.div>
          )}

          {activeLayer === 'diagnostics' && (
            <motion.div
              key="diagnostics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{ y: foregroundY }}
            >
              <DiagnosticDashboard domain={domain} dealerId={dealerId} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Depth Layer 3: Floating Particles (Optional) */}
      {typeof window !== 'undefined' && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              animate={{
                y: [null, -100, -200],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
    </IntelligenceShell>
  );
}

