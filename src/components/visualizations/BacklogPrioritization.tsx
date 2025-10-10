"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface BacklogTask {
  taskId: string;
  title: string;
  estDeltaAivLow: number;
  estDeltaAivHigh: number;
  projectedImpactLowUsd: number;
  projectedImpactHighUsd: number;
  effortPoints: number;
  banditScore?: number;
}

interface BacklogPrioritizationProps {
  backlog: BacklogTask[];
}

type SortBy = 'bandit' | 'impact' | 'effort' | 'roi';

export default function BacklogPrioritization({ backlog }: BacklogPrioritizationProps) {
  const [sortBy, setSortBy] = useState<SortBy>('bandit');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getEffortColor = (points: number) => {
    if (points <= 2) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (points <= 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
  };

  const getEffortLabel = (points: number) => {
    if (points <= 2) return 'Quick Win';
    if (points <= 4) return 'Medium';
    return 'Complex';
  };

  const calculateROI = (task: BacklogTask) => {
    const avgImpact = (task.projectedImpactHighUsd + task.projectedImpactLowUsd) / 2;
    return avgImpact / task.effortPoints;
  };

  const sortedBacklog = [...backlog].sort((a, b) => {
    switch (sortBy) {
      case 'bandit':
        return (b.banditScore || 0) - (a.banditScore || 0);
      case 'impact':
        return ((b.projectedImpactHighUsd + b.projectedImpactLowUsd) / 2) - ((a.projectedImpactHighUsd + a.projectedImpactLowUsd) / 2);
      case 'effort':
        return a.effortPoints - b.effortPoints;
      case 'roi':
        return calculateROI(b) - calculateROI(a);
      default:
        return 0;
    }
  });

  const totalPotentialLow = backlog.reduce((sum, task) => sum + task.projectedImpactLowUsd, 0);
  const totalPotentialHigh = backlog.reduce((sum, task) => sum + task.projectedImpactHighUsd, 0);
  const totalEffort = backlog.reduce((sum, task) => sum + task.effortPoints, 0);

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Optimization Backlog</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bandit">Bandit Score</option>
            <option value="impact">Revenue Impact</option>
            <option value="effort">Effort (Low to High)</option>
            <option value="roi">ROI</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg">
          <div className="text-xs text-gray-300 mb-1">Total Tasks</div>
          <div className="text-3xl font-bold text-white">{backlog.length}</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg">
          <div className="text-xs text-gray-300 mb-1">Potential Revenue</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency((totalPotentialLow + totalPotentialHigh) / 2)}</div>
          <div className="text-xs text-gray-400 mt-1">
            {formatCurrency(totalPotentialLow)} - {formatCurrency(totalPotentialHigh)}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg">
          <div className="text-xs text-gray-300 mb-1">Total Effort</div>
          <div className="text-3xl font-bold text-yellow-400">{totalEffort}</div>
          <div className="text-xs text-gray-400 mt-1">Story points</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg">
          <div className="text-xs text-gray-300 mb-1">Avg ROI</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatCurrency((totalPotentialLow + totalPotentialHigh) / 2 / totalEffort)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Per point</div>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {sortedBacklog.map((task, index) => {
          const roi = calculateROI(task);
          const avgImpact = (task.projectedImpactHighUsd + task.projectedImpactLowUsd) / 2;
          const avgAIV = (task.estDeltaAivHigh + task.estDeltaAivLow) / 2;

          return (
            <div
              key={task.taskId}
              className="p-6 bg-gradient-to-r from-white/5 to-white/[0.02] rounded-lg border border-white/10 hover:border-blue-500/50 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                    <Badge className="bg-blue-500/20 text-blue-400">{task.taskId}</Badge>
                    {task.banditScore && (
                      <Badge className="bg-purple-500/20 text-purple-400">
                        Bandit: {task.banditScore.toFixed(2)}
                      </Badge>
                    )}
                    <Badge className={getEffortColor(task.effortPoints)}>
                      {getEffortLabel(task.effortPoints)}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Effort</div>
                  <div className="text-2xl font-bold text-white">{task.effortPoints}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">AIV Impact</div>
                  <div className="text-lg font-bold text-white">+{avgAIV.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">
                    {task.estDeltaAivLow.toFixed(1)} - {task.estDeltaAivHigh.toFixed(1)}
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Revenue Impact</div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(avgImpact)}</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(task.projectedImpactLowUsd).slice(0, -3)}k - {formatCurrency(task.projectedImpactHighUsd).slice(0, -3)}k
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">ROI per Point</div>
                  <div className="text-lg font-bold text-purple-400">{formatCurrency(roi)}</div>
                  <div className="text-xs text-gray-500">Impact / Effort</div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Priority</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {task.banditScore ? (task.banditScore * 100).toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>

              {/* Visual Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Impact Potential</span>
                    <span>{((avgImpact / totalPotentialHigh) * 100).toFixed(0)}% of total</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500 group-hover:scale-x-105 origin-left"
                      style={{ width: `${(avgImpact / totalPotentialHigh) * 100}%` }}
                    />
                  </div>
                </div>

                {task.banditScore && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Optimization Priority</span>
                      <span>{(task.banditScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                        style={{ width: `${task.banditScore * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Matrix Visualization */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Impact vs Effort Matrix</h4>
        <div className="relative bg-white/5 rounded-lg p-6" style={{ height: '300px' }}>
          {/* Axis labels */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400">
            Higher Impact →
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gray-400">
            → Lower Effort
          </div>

          {/* Quadrants */}
          <div className="absolute inset-6 grid grid-cols-2 grid-rows-2 gap-1">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded flex items-center justify-center">
              <span className="text-xs text-yellow-400/50">Major Projects</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded flex items-center justify-center">
              <span className="text-xs text-green-400/50">Quick Wins</span>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/20 rounded flex items-center justify-center">
              <span className="text-xs text-gray-400/50">Fill-ins</span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded flex items-center justify-center">
              <span className="text-xs text-blue-400/50">Easy Gains</span>
            </div>
          </div>

          {/* Plot tasks */}
          <div className="absolute inset-6">
            {backlog.map((task, index) => {
              const avgImpact = (task.projectedImpactHighUsd + task.projectedImpactLowUsd) / 2;
              const x = ((8 - task.effortPoints) / 7) * 100; // Lower effort = further right
              const y = ((avgImpact / totalPotentialHigh) * 100); // Higher impact = higher up

              return (
                <div
                  key={task.taskId}
                  className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white/50 hover:scale-150 transition-transform cursor-pointer"
                  style={{
                    left: `${x}%`,
                    bottom: `${y}%`,
                    transform: 'translate(-50%, 50%)'
                  }}
                  title={task.title}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
