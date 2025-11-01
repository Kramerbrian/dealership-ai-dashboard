'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  benchmark?: {
    label: string;
    value: number;
  };
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  icon?: ReactNode;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  unit = '',
  trend,
  benchmark,
  status = 'good',
  icon,
  description,
  onClick,
  className = ''
}: MetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'good':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'neutral':
        return '→';
      default:
        return '';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative rounded-apple-lg border-2 p-6 transition-all duration-200
        ${getStatusColor(status)}
        ${onClick ? 'cursor-pointer hover:shadow-apple-medium' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Icon */}
      {icon && (
        <div className="absolute top-4 right-4 text-2xl opacity-60">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-medium opacity-80 mb-2">
        {title}
      </h3>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className="text-sm opacity-70">
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor(trend.direction)}`}>
          <span className="text-lg">
            {getTrendIcon(trend.direction)}
          </span>
          <span className="font-medium">
            {Math.abs(trend.value)}%
          </span>
          {trend.period && (
            <span className="opacity-70">
              {trend.period}
            </span>
          )}
        </div>
      )}

      {/* Benchmark */}
      {benchmark && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="flex justify-between items-center text-xs">
            <span className="opacity-70">
              {benchmark.label}
            </span>
            <span className="font-medium">
              {benchmark.value}
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs opacity-70 leading-relaxed">
            {description}
          </p>
        </div>
      )}

      {/* Click indicator */}
      {onClick && (
        <div className="absolute bottom-2 right-2 text-xs opacity-50">
          Click for details
        </div>
      )}
    </motion.div>
  );
}
