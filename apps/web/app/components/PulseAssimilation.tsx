'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  kpis: any;
  brandTint: string;
}

export default function PulseAssimilation({ kpis, brandTint }: Props) {
  const [tiles, setTiles] = useState<Array<{ id: number; content: string }>>([]);

  const pulseTiles = [
    { id: 1, content: 'Market Pulse Active' },
    { id: 2, content: 'AI Visibility Tracking' },
    { id: 3, content: 'Competitor Analysis' },
    { id: 4, content: 'Revenue Protection' },
    { id: 5, content: 'Schema Optimization' },
    { id: 6, content: 'E-E-A-T Monitoring' },
  ];

  useEffect(() => {
    // Dissolve tiles in one by one
    pulseTiles.forEach((tile, idx) => {
      setTimeout(() => {
        setTiles((prev) => [...prev, tile]);
      }, idx * 200);
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 p-8"
      style={{
        background: `linear-gradient(135deg, #000 0%, ${brandTint}05 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: brandTint }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          PULSE ASSIMILATION
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6"
                style={{
                  borderColor: `${brandTint}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{tile.content}</span>
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ background: brandTint }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* KPI summary cards */}
        {kpis?.kpis && tiles.length === pulseTiles.length && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'VAI', value: kpis.kpis.vai, trend: kpis.trends?.vai },
              { label: 'PIQR', value: kpis.kpis.piqr, trend: kpis.trends?.piqr },
              { label: 'QAI', value: kpis.kpis.qai, trend: kpis.trends?.qai },
              { label: 'HRP', value: kpis.kpis.hrp },
            ].map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold mb-1" style={{ color: brandTint }}>
                  {metric.value}
                  {metric.label !== 'HRP' && '%'}
                </div>
                <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                {metric.trend && (
                  <div
                    className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {metric.trend === 'up' ? '↗' : '↘'} {metric.trend}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  kpis: any;
  brandTint: string;
}

export default function PulseAssimilation({ kpis, brandTint }: Props) {
  const [tiles, setTiles] = useState<Array<{ id: number; content: string }>>([]);

  const pulseTiles = [
    { id: 1, content: 'Market Pulse Active' },
    { id: 2, content: 'AI Visibility Tracking' },
    { id: 3, content: 'Competitor Analysis' },
    { id: 4, content: 'Revenue Protection' },
    { id: 5, content: 'Schema Optimization' },
    { id: 6, content: 'E-E-A-T Monitoring' },
  ];

  useEffect(() => {
    // Dissolve tiles in one by one
    pulseTiles.forEach((tile, idx) => {
      setTimeout(() => {
        setTiles((prev) => [...prev, tile]);
      }, idx * 200);
    });
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 p-8"
      style={{
        background: `linear-gradient(135deg, #000 0%, ${brandTint}05 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: brandTint }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          PULSE ASSIMILATION
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6"
                style={{
                  borderColor: `${brandTint}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{tile.content}</span>
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ background: brandTint }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* KPI summary cards */}
        {kpis?.kpis && tiles.length === pulseTiles.length && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'VAI', value: kpis.kpis.vai, trend: kpis.trends?.vai },
              { label: 'PIQR', value: kpis.kpis.piqr, trend: kpis.trends?.piqr },
              { label: 'QAI', value: kpis.kpis.qai, trend: kpis.trends?.qai },
              { label: 'HRP', value: kpis.kpis.hrp },
            ].map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold mb-1" style={{ color: brandTint }}>
                  {metric.value}
                  {metric.label !== 'HRP' && '%'}
                </div>
                <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                {metric.trend && (
                  <div
                    className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {metric.trend === 'up' ? '↗' : '↘'} {metric.trend}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

