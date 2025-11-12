'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  MapPin,
  Shield,
  Star,
  MessageSquare,
  FileCode,
  Trophy,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface ClarityStackData {
  scores: {
    seo: number;
    aeo: number;
    geo: number;
    avi: number;
  };
  location?: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  };
  gbp: {
    score: number;
    rating: number;
    review_count: number;
    issues?: string[];
  };
  ugc: {
    score: number;
    velocity?: number;
    response_rate?: number;
    issues?: string[];
  };
  schema: {
    coverage: number;
    issues?: string[];
  };
  competitive: {
    rank: number;
    total: number;
    leaders?: Array<{ name: string; score: number }>;
    gap?: number;
  };
  revenue_at_risk: {
    monthly: number;
    annual: number;
    assumptions?: Record<string, any>;
  };
  ai_intro_current?: string;
  ai_intro_improved?: string;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface PulseOverviewProps {
  data: ClarityStackData;
  domain: string;
}

function ScoreCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'emerald' | 'cyan';
  subtitle?: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
    },
    purple: {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-400',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      icon: 'text-cyan-400',
      gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-4xl font-bold ${getScoreColor(value)}`}>
          {value}
        </div>
        <span className="text-sm text-white/50">/100</span>
      </div>
      <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${colors.gradient}`}
        />
      </div>
    </motion.div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  issues,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  issues?: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-white/60" />
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-xs text-white/50 mb-3">{subtitle}</p>}
      {issues && issues.length > 0 && (
        <div className="mt-4 space-y-2">
          {issues.slice(0, 2).map((issue, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-yellow-400/80">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function PulseOverview({ data, domain }: PulseOverviewProps) {
  const { scores, gbp, ugc, schema, competitive, revenue_at_risk } = data;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Pulse Overview</h1>
        <p className="text-white/60">
          AI visibility analytics for <span className="text-white/80 font-mono">{domain}</span>
        </p>
      </div>

      {/* Clarity Stack Scores */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Clarity Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            title="SEO"
            value={scores.seo}
            icon={TrendingUp}
            color="blue"
            subtitle="Search Engine Optimization"
          />
          <ScoreCard
            title="AEO"
            value={scores.aeo}
            icon={Eye}
            color="purple"
            subtitle="Answer Engine Optimization"
          />
          <ScoreCard
            title="GEO"
            value={scores.geo}
            icon={MapPin}
            color="emerald"
            subtitle="Generative Engine Optimization"
          />
          <ScoreCard
            title="AVI"
            value={scores.avi}
            icon={Shield}
            color="cyan"
            subtitle="AI Visibility Index"
          />
        </div>
      </div>

      {/* GBP Health */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Google Business Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Health Score"
            value={gbp.score}
            icon={Shield}
            subtitle={`${gbp.rating}★ rating from ${gbp.review_count} reviews`}
            issues={gbp.issues}
          />
          <MetricCard
            title="Rating"
            value={`${gbp.rating}★`}
            icon={Star}
            subtitle={`Based on ${gbp.review_count} reviews`}
          />
          <MetricCard
            title="Review Count"
            value={gbp.review_count}
            icon={MessageSquare}
            subtitle="Total customer reviews"
          />
        </div>
      </div>

      {/* UGC & Reviews */}
      <div>
        <h2 className="text-xl font-semibold mb-4">UGC & Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="UGC Score"
            value={ugc.score}
            icon={MessageSquare}
            subtitle="User-generated content quality"
            issues={ugc.issues}
          />
          {ugc.velocity !== undefined && (
            <MetricCard
              title="Review Velocity"
              value={ugc.velocity}
              icon={TrendingUp}
              subtitle="Reviews per month"
            />
          )}
          {ugc.response_rate !== undefined && (
            <MetricCard
              title="Response Rate"
              value={`${Math.round(ugc.response_rate * 100)}%`}
              icon={MessageSquare}
              subtitle="Reviews responded to"
            />
          )}
        </div>
      </div>

      {/* Schema Coverage */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Schema Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Coverage"
            value={`${Math.round(schema.coverage * 100)}%`}
            icon={FileCode}
            subtitle="Structured data coverage"
            issues={schema.issues}
          />
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileCode className="w-5 h-5 text-white/60" />
              <h3 className="text-sm font-medium text-white/80">Schema Issues</h3>
            </div>
            {schema.issues && schema.issues.length > 0 ? (
              <ul className="space-y-2">
                {schema.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-400/80 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No schema issues detected</p>
            )}
          </div>
        </div>
      </div>

      {/* Competitive Position */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Competitive Position</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Market Rank"
            value={`#${competitive.rank}`}
            icon={Trophy}
            subtitle={`Out of ${competitive.total} competitors`}
          />
          {competitive.gap !== undefined && (
            <MetricCard
              title="Gap to Leader"
              value={`${competitive.gap} pts`}
              icon={TrendingUp}
              subtitle={
                competitive.gap > 0
                  ? `${competitive.gap} points behind market leader`
                  : 'Leading the market'
              }
            />
          )}
        </div>
        {competitive.leaders && competitive.leaders.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-white/80 mb-3">Market Leaders</h3>
            <div className="space-y-2">
              {competitive.leaders.map((leader, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{leader.name}</span>
                  <span className="text-white/90 font-medium">{leader.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Revenue at Risk */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Revenue at Risk</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Monthly Revenue at Risk"
            value={`$${(revenue_at_risk.monthly / 1000).toFixed(0)}K`}
            icon={DollarSign}
            subtitle="Potential revenue loss per month"
          />
          <MetricCard
            title="Annual Revenue at Risk"
            value={`$${(revenue_at_risk.annual / 1000).toFixed(0)}K`}
            icon={DollarSign}
            subtitle="Potential revenue loss per year"
          />
        </div>
      </div>
    </div>
  );
}

