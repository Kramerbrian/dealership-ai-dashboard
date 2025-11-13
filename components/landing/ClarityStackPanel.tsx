'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shield, Eye, MapPin, DollarSign } from 'lucide-react';

interface ClarityStackPanelProps {
  scores: {
    seo: number;
    aeo: number;
    geo: number;
    avi: number;
  };
  revenue_at_risk: {
    monthly: number;
    annual: number;
  };
  competitive?: {
    rank: number;
    total: number;
    gap?: number;
  };
}

export function ClarityStackPanel({ scores, revenue_at_risk, competitive }: ClarityStackPanelProps) {
  const scoreItems = [
    { label: 'SEO', value: scores.seo, icon: TrendingUp, color: 'blue' },
    { label: 'AEO', value: scores.aeo, icon: Eye, color: 'purple' },
    { label: 'GEO', value: scores.geo, icon: MapPin, color: 'emerald' },
    { label: 'AVI', value: scores.avi, icon: Shield, color: 'cyan' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4">Clarity Stack Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scoreItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="text-center"
              >
                <Icon className="w-5 h-5 mx-auto mb-2 text-white/60" />
                <div className={`text-3xl font-bold ${getScoreColor(item.value)}`}>
                  {item.value}
                </div>
                <div className="text-xs text-white/60 mt-1">{item.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white/80">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Revenue at Risk</span>
          </div>
        </div>
        <div className="flex items-baseline gap-4">
          <div>
            <div className="text-2xl font-bold text-red-400">
              ${(revenue_at_risk.monthly / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-white/60">Monthly</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-red-300">
              ${(revenue_at_risk.annual / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-white/60">Annual</div>
          </div>
        </div>
      </div>

      {competitive && (
        <div className="border-t border-white/10 pt-4">
          <div className="text-sm text-white/80 mb-2">Competitive Position</div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-bold text-white">
                #{competitive.rank}
              </div>
              <div className="text-xs text-white/60">of {competitive.total}</div>
            </div>
            {competitive.gap !== undefined && (
              <div className="text-sm text-white/60">
                {competitive.gap > 0 ? (
                  <span className="text-yellow-400">+{competitive.gap} points behind leader</span>
                ) : (
                  <span className="text-green-400">Leading the market</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

