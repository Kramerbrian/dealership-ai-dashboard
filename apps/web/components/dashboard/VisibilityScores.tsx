/**
 * Visibility Scores Component
 * Core AI visibility metrics display
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface VisibilityScoresProps {
  dealershipId: string;
}

export function VisibilityScores({ dealershipId }: VisibilityScoresProps) {
  // Mock data for now
  const scores = {
    aiVisibility: 78.5,
    zeroClick: 65.2,
    ugcHealth: 82.1,
    geoTrust: 71.8,
    sgpIntegrity: 89.3
  };

  const metrics = [
    { key: 'aiVisibility', label: 'AI Visibility', score: scores.aiVisibility, color: 'text-blue-600' },
    { key: 'zeroClick', label: 'Zero-Click Rate', score: scores.zeroClick, color: 'text-green-600' },
    { key: 'ugcHealth', label: 'UGC Health', score: scores.ugcHealth, color: 'text-purple-600' },
    { key: 'geoTrust', label: 'Geo Trust', score: scores.geoTrust, color: 'text-orange-600' },
    { key: 'sgpIntegrity', label: 'SGP Integrity', score: scores.sgpIntegrity, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Visibility Scores</CardTitle>
          <CardDescription>
            Core metrics for AI-powered search visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{metric.label}</h3>
                    <span className={`text-2xl font-bold ${metric.color}`}>
                      {metric.score}
                    </span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {metric.score >= 80 
                      ? 'Excellent performance'
                      : metric.score >= 70
                      ? 'Good performance'
                      : 'Needs improvement'
                    }
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
