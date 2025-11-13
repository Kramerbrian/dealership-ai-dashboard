import React from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

export interface ScoreCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  color?: string;
  bgColor?: string;
  sparklineData?: { t: number | string; v: number }[];
  onClick?: () => void;
  className?: string;
  showRing?: boolean;
}

/**
 * Reusable ScoreCard Component
 * One component, infinite variations
 *
 * @example
 * <ScoreCard
 *   title="AI Visibility Score"
 *   value={85}
 *   trend="up"
 *   trendValue="+12%"
 *   description="vs last month"
 *   color="text-green-500"
 *   sparklineData={data}
 * />
 */
export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  description,
  color = 'text-blue-600',
  bgColor = 'bg-white',
  sparklineData,
  onClick,
  className = '',
  showRing = false,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;

    const icons = {
      up: '↑',
      down: '↓',
      neutral: '→',
    };

    const colors = {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-gray-500',
    };

    return (
      <span className={`${colors[trend]} font-bold`}>
        {icons[trend]}
      </span>
    );
  };

  const ringStyle = showRing && typeof value === 'number' ? {
    background: `conic-gradient(${color.replace('text-', '')} ${value * 3.6}deg, #e5e7eb ${value * 3.6}deg)`,
  } : undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-6
        ${bgColor} dark:bg-neutral-900/60
        shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]
        border border-neutral-200/60 dark:border-neutral-800
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Icon/Ring */}
      {(icon || showRing) && (
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div className={`p-3 rounded-lg ${bgColor === 'bg-white' ? 'bg-gray-100' : 'bg-gray-800'}`}>
              <div className={`w-6 h-6 ${color}`}>
                {icon}
              </div>
            </div>
          )}

          {showRing && typeof value === 'number' && (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={ringStyle}
            >
              <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center">
                <span className={`text-lg font-bold ${color}`}>{Math.round(value)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 tracking-tight">
        {title}
      </h3>

      {/* Value & Trend */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className={`text-3xl font-bold ${color}`}>
          {value}
        </span>

        {(trend || trendValue) && (
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon()}
            {trendValue && (
              <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {description}
        </p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12 -mx-2 -mb-2 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={color.replace('text-', '')}
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
    </motion.div>
  );
};

export default ScoreCard;
