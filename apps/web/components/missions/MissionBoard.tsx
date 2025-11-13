'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { designTokens, getMissionStatusColor } from '@/lib/design-tokens';

interface Mission {
  id: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  category: 'quick-win' | 'strategic' | 'maintenance';
  estimatedTime: string; // "2 min", "1 hour", etc.
  impact: 'low' | 'medium' | 'high';
  status: 'available' | 'active' | 'queued' | 'completed' | 'failed';
  confidence?: number; // 0-1, only for active/completed missions
  progress?: number; // 0-100, only for active missions
  completedAt?: number;
  startedAt?: number;
  evidence?: {
    count: number;
    lastUpdated: number;
  };
}

interface MissionBoardProps {
  missions: Mission[];
  onLaunchMission: (missionId: string) => void;
  onPauseMission: (missionId: string) => void;
  onViewDetails: (missionId: string) => void;
  onViewEvidence: (missionId: string) => void;
}

/**
 * MissionBoard - Interactive task management for the Cognitive Ops Platform
 *
 * Features:
 * - Quick-win missions (< 5 min, high impact)
 * - Real-time progress tracking
 * - Confidence scoring
 * - Evidence collection indicators
 * - One-click launch
 * - Drag-to-reorder (future)
 *
 * Visual Design:
 * - Color-coded by status (active/queued/completed/failed)
 * - Impact badges (low/medium/high)
 * - Animated progress bars
 * - Hover states with details
 */
export function MissionBoard({
  missions,
  onLaunchMission,
  onPauseMission,
  onViewDetails,
  onViewEvidence,
}: MissionBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Mission['category'] | 'all'>('all');

  // Filter missions by category
  const filteredMissions =
    selectedCategory === 'all'
      ? missions
      : missions.filter((m) => m.category === selectedCategory);

  // Group missions by status
  const activeMissions = filteredMissions.filter((m) => m.status === 'active');
  const queuedMissions = filteredMissions.filter((m) => m.status === 'queued');
  const availableMissions = filteredMissions.filter((m) => m.status === 'available');
  const completedMissions = filteredMissions.filter((m) => m.status === 'completed');

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#1e293b] p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Mission Board</h2>
            <p className="text-sm text-white/60">
              {activeMissions.length} active · {availableMissions.length} available
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {(['all', 'quick-win', 'strategic', 'maintenance'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    selectedCategory === category
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {category === 'all' ? 'All' : category.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Missions */}
      {activeMissions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Missions
          </h3>
          <div className="grid gap-4">
            {activeMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onLaunch={onLaunchMission}
                onPause={onPauseMission}
                onViewDetails={onViewDetails}
                onViewEvidence={onViewEvidence}
              />
            ))}
          </div>
        </div>
      )}

      {/* Queued Missions */}
      {queuedMissions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Queued Missions
          </h3>
          <div className="grid gap-4">
            {queuedMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onLaunch={onLaunchMission}
                onPause={onPauseMission}
                onViewDetails={onViewDetails}
                onViewEvidence={onViewEvidence}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Missions */}
      {availableMissions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Available Missions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {availableMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onLaunch={onLaunchMission}
                onPause={onPauseMission}
                onViewDetails={onViewDetails}
                onViewEvidence={onViewEvidence}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Completed ({completedMissions.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onLaunch={onLaunchMission}
                onPause={onPauseMission}
                onViewDetails={onViewDetails}
                onViewEvidence={onViewEvidence}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Sparkles className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/60 text-center">
            No missions found in this category.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * MissionCard - Individual mission display
 */
function MissionCard({
  mission,
  onLaunch,
  onPause,
  onViewDetails,
  onViewEvidence,
  compact = false,
}: {
  mission: Mission;
  onLaunch: (missionId: string) => void;
  onPause: (missionId: string) => void;
  onViewDetails: (missionId: string) => void;
  onViewEvidence: (missionId: string) => void;
  compact?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Status styling
  const statusConfig = {
    available: {
      border: 'border-white/10',
      bg: 'bg-white/5',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
    active: {
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      icon: <Play className="w-4 h-4 text-green-400" />,
    },
    queued: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    },
    completed: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    failed: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    },
  };

  const config = statusConfig[mission.status];

  // Impact badge color
  const impactColors = {
    low: 'bg-gray-500/20 text-gray-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        ${config.bg} ${config.border}
        backdrop-blur-md rounded-lg p-4 border transition-all
        hover:border-white/30 cursor-pointer
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={() => onViewDetails(mission.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {config.icon}
          <div className="flex-1">
            <h4 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
              {mission.title}
            </h4>
            {!compact && (
              <p className="text-xs text-white/60 mt-1">{mission.description}</p>
            )}
          </div>
        </div>

        {/* Impact Badge */}
        <span
          className={`
            ${impactColors[mission.impact]}
            px-2 py-1 rounded text-xs font-medium uppercase tracking-wide
          `}
        >
          {mission.impact}
        </span>
      </div>

      {/* Metadata */}
      {!compact && (
        <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {mission.estimatedTime}
          </div>
          <div>{mission.agentName}</div>
          {mission.category === 'quick-win' && (
            <div className="flex items-center gap-1 text-purple-400">
              <TrendingUp className="w-3 h-3" />
              Quick Win
            </div>
          )}
        </div>
      )}

      {/* Progress Bar (Active missions) */}
      {mission.status === 'active' && mission.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Progress</span>
            <span>{Math.round(mission.progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${mission.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Confidence Score (Active/Completed missions) */}
      {mission.confidence !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Confidence</span>
            <span
              className={`font-medium ${
                mission.confidence >= 0.85
                  ? 'text-emerald-400'
                  : mission.confidence >= 0.65
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {Math.round(mission.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Evidence Indicator */}
      {mission.evidence && mission.evidence.count > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewEvidence(mission.id);
          }}
          className="w-full mb-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/80 flex items-center justify-between transition-colors"
        >
          <span>{mission.evidence.count} Evidence Items</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {mission.status === 'available' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(mission.id);
            }}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Launch Mission
          </button>
        )}

        {mission.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPause(mission.id);
            }}
            className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}

        {mission.status === 'completed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(mission.id);
            }}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            View Results
          </button>
        )}
      </div>
    </motion.div>
  );
}
