'use client'

import React from 'react'

export interface SecondaryMetricProps {
  value: number | string
  label: string
  status?: 'good' | 'fair' | 'poor'
  className?: string
}

/**
 * Secondary Metric Component - Clay UX Principle
 * Two secondary metrics max, supporting the primary
 */
export default function SecondaryMetric({
  value,
  label,
  status,
  className = '',
}: SecondaryMetricProps) {
  const statusColors = {
    good: 'text-green-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600',
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div
        className={`text-2xl font-bold tabular-nums ${
          status ? statusColors[status] : 'text-gray-900'
        }`}
      >
        {typeof value === 'number' ? value.toFixed(0) : value}
      </div>
    </div>
  )
}

