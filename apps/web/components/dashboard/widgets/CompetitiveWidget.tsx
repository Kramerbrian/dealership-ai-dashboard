/**
 * Competitive Widget
 * Market position, competitor analysis, gap analysis
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompetitiveWidgetProps {
  data: {
    marketPosition: number; // rank out of competitors
    totalCompetitors: number;
    marketShare: number; // percentage
    averageCompetitorScore: number;
    yourScore: number;
    topCompetitors: Array<{
      name: string;
      score: number;
      gap: number; // difference from your score
      trend: 'up' | 'down' | 'neutral';
    }>;
    gaps: Array<{
      metric: string;
      yourValue: number;
      marketAverage: number;
      gap: number;
    }>;
  };
}

export default function CompetitiveWidget({ data }: CompetitiveWidgetProps) {
  const positionPercentile = ((data.totalCompetitors - data.marketPosition + 1) / data.totalCompetitors) * 100;

  return (
    <div className="space-y-6">
      {/* Market Position */}
      <Card>
        <CardHeader>
          <CardTitle>Market Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl font-bold text-gray-900">#{data.marketPosition}</div>
                <div className="text-2xl text-gray-400">of {data.totalCompetitors}</div>
              </div>
              <p className="text-sm text-gray-600">
                {positionPercentile.toFixed(0)}th percentile • {data.marketShare.toFixed(1)}% market share
              </p>
            </div>
            <Target className="w-16 h-16 text-blue-500" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${positionPercentile}%` }}
              transition={{ duration: 1 }}
              className="h-3 rounded-full bg-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Score Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Score Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Your Score</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-gray-900">{data.yourScore}</div>
                <div className="text-2xl text-gray-400">/100</div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Market Average</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-gray-600">{data.averageCompetitorScore}</div>
                <div className="text-2xl text-gray-400">/100</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {data.yourScore > data.averageCompetitorScore ? (
                <>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-600">
                    +{(data.yourScore - data.averageCompetitorScore).toFixed(1)} points above average
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-600">
                    {(data.yourScore - data.averageCompetitorScore).toFixed(1)} points below average
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Competitors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Competitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCompetitors.map((competitor, idx) => (
              <motion.div
                key={competitor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-bold text-blue-600">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{competitor.name}</p>
                    <p className="text-sm text-gray-600">Score: {competitor.score}/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {competitor.gap > 0 ? (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">+{competitor.gap.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">ahead</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{competitor.gap.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">behind</p>
                    </div>
                  )}
                  {competitor.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {competitor.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.gaps.map((gap, idx) => (
              <motion.div
                key={gap.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{gap.metric}</span>
                  <span className={`text-sm font-semibold ${
                    gap.gap > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {gap.gap > 0 ? '+' : ''}{gap.gap.toFixed(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">You: {gap.yourValue.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Market Avg: {gap.marketAverage.toFixed(1)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

