'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  kpis: any;
  brandTint: string;
}

export default function OrchestratorReadyState({ kpis, brandTint }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  const steps = [
    { progress: 20, status: 'Loading market data...' },
    { progress: 40, status: 'Computing AI visibility...' },
    { progress: 60, status: 'Analyzing competitors...' },
    { progress: 80, status: 'Generating insights...' },
    { progress: 100, status: 'Orchestrator ready' },
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: `linear-gradient(135deg, ${brandTint}10 0%, #000 100%)`,
      }}
    >
      <div className="max-w-2xl w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-5xl font-bold mb-4"
            style={{ color: brandTint }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ORCHESTRATOR 3.0
          </motion.h1>
          <p className="text-gray-400 text-lg">{status}</p>
        </motion.div>

        {/* Progress bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-8">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: brandTint }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* KPI Grid */}
        {kpis?.kpis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'VAI', value: kpis.kpis.vai, unit: '%' },
              { label: 'PIQR', value: kpis.kpis.piqr, unit: '%' },
              { label: 'QAI', value: kpis.kpis.qai, unit: '%' },
              { label: 'HRP', value: kpis.kpis.hrp, unit: '' },
            ].map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5 + idx * 0.1, type: 'spring' }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 text-center"
              >
                <div className="text-2xl font-bold mb-1" style={{ color: brandTint }}>
                  {metric.value}
                  {metric.unit}
                </div>
                <div className="text-xs text-gray-400">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Revenue at risk */}
        {kpis?.financial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="mt-8 text-center"
          >
            <div className="text-sm text-gray-400 mb-2">Revenue at Risk</div>
            <div className="text-4xl font-bold" style={{ color: brandTint }}>
              ${kpis.financial.revenueAtRisk.toLocaleString()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

