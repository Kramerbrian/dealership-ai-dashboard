'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface PrimaryMetricProps {
  value: number
  label: string
  trend?: {
    value: number // Percentage change
    direction: 'up' | 'down' | 'stable'
  }
  subtitle?: string
  onClick?: () => void
  className?: string
}

/**
 * Primary Metric Component - Clay UX Principle
 * One primary KPI with clear visual hierarchy
 */
export default function PrimaryMetric({
  value,
  label,
  trend,
  subtitle,
  onClick,
  className = '',
}: PrimaryMetricProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-500',
  }

  const TrendIcon = trend
    ? trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
        ? TrendingDown
        : Minus
    : null

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-8 text-center ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className="text-5xl font-black text-gray-900 mb-2 tabular-nums">
        {value.toFixed(1)}
      </div>
      {trend && (
        <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${trendColors[trend.direction]}`}>
          {TrendIcon && <TrendIcon className="w-4 h-4" />}
          <span>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        </div>
      )}
      {subtitle && (
        <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
      )}
    </div>
  )
}

