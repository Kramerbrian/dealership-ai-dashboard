'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface CompetitiveData {
  your_avi: number;
  leader_avi: number;
  your_seo: number;
  leader_seo: number;
  your_aeo: number;
  leader_aeo: number;
  your_geo: number;
  leader_geo: number;
  top_competitors: Array<{ name: string; avi: number }>;
  battle_plan: Array<{
    action: string;
    impact: string;
    avi_gain: string;
  }>;
}

interface CompetitiveBattlePlanProps {
  data: CompetitiveData;
  tier?: 'free' | 'pro' | 'enterprise';
  onOpenPlaybook?: () => void;
  onAutoGenerate?: () => void;
}

/**
 * Competitive Battle Plan Drawer
 * Shows "You vs Local AI Field" comparison and ranked battle plan
 */
export default function CompetitiveBattlePlan({
  data,
  tier = 'free',
  onOpenPlaybook,
  onAutoGenerate,
}: CompetitiveBattlePlanProps) {
  const [expanded, setExpanded] = useState(false);

  const getGapColor = (your: number, leader: number) => {
    const gap = leader - your;
    if (gap > 20) return 'text-red-500';
    if (gap > 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Competitive Battle Plan</h2>
          <ArrowRight
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          You vs Local AI Field (Naples Toyota DMA)
        </p>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-6 space-y-6"
        >
          {/* Score Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">AI Visibility (AVI)</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">You {data.your_avi}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className={`text-lg font-bold ${getGapColor(data.your_avi, data.leader_avi)}`}>
                    Leader {data.leader_avi}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">SEO Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{data.your_seo}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className={`text-sm font-semibold ${getGapColor(data.your_seo, data.leader_seo)}`}>
                    {data.leader_seo}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">AEO Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{data.your_aeo}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className={`text-sm font-semibold ${getGapColor(data.your_aeo, data.leader_aeo)}`}>
                    {data.leader_aeo}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">GEO Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{data.your_geo}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className={`text-sm font-semibold ${getGapColor(data.your_geo, data.leader_geo)}`}>
                    {data.leader_geo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Competitors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top 3 Competitors</h3>
            <div className="space-y-2">
              {data.top_competitors.map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{i + 1}.</span>
                    <span className="text-sm text-gray-900">{comp.name}</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">AVI {comp.avi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Battle Plan */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Battle Plan (Ranked)</h3>
            <div className="space-y-3">
              {data.battle_plan.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.impact}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">{item.avi_gain}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {tier === 'pro' || tier === 'enterprise' ? (
              <>
                <button
                  onClick={onOpenPlaybook}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Open Playbook
                </button>
                <button
                  onClick={onAutoGenerate}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Auto-Generate Tasks
                </button>
              </>
            ) : (
              <div className="flex-1 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Upgrade to Pro</strong> to unlock Playbooks and Auto-Generate Tasks
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

