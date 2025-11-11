'use client'

import React from 'react'
import { ArrowRight, AlertCircle, CheckCircle2, Info } from 'lucide-react'

export interface PulseCardProps {
  headline: string
  subhead: string
  impact?: number // Revenue impact in dollars
  effort?: string // Time to fix
  severity?: 'low' | 'medium' | 'high' | 'critical'
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>
  evidence?: {
    thumbnail?: string
    description?: string
  }
  className?: string
}

/**
 * Pulse Card Component - Clay UX Principle
 * Converts data into narrative with clear action path
 */
export default function PulseCard({
  headline,
  subhead,
  impact,
  effort,
  severity = 'medium',
  actions = [],
  evidence,
  className = '',
}: PulseCardProps) {
  const severityColors = {
    low: 'border-green-500/50 bg-green-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    high: 'border-orange-500/50 bg-orange-500/5',
    critical: 'border-red-500/50 bg-red-500/5',
  }

  const severityIcons = {
    low: CheckCircle2,
    medium: Info,
    high: AlertCircle,
    critical: AlertCircle,
  }

  const Icon = severityIcons[severity]

  // Detect dark mode from className or parent context
  const isDark = className.includes('bg-white/5') || className.includes('border-white/10')

  const darkSeverityColors = {
    low: 'border-green-400/30 bg-green-500/10',
    medium: 'border-yellow-400/30 bg-yellow-500/10',
    high: 'border-orange-400/30 bg-orange-500/10',
    critical: 'border-red-400/30 bg-red-500/10',
  }

  const lightSeverityColors = {
    low: 'border-green-500/50 bg-green-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    high: 'border-orange-500/50 bg-orange-500/5',
    critical: 'border-red-500/50 bg-red-500/5',
  }

  const severityBorderColors = isDark ? darkSeverityColors : lightSeverityColors

  return (
    <div
      className={`rounded-2xl border p-6 transition-all hover:shadow-lg hover:scale-[1.01] ${severityBorderColors[severity]} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${
          isDark 
            ? `bg-${severity}-500/20` 
            : `bg-${severity}-500/10`
        }`}>
          <Icon className={`w-5 h-5 ${
            isDark 
              ? `text-${severity}-400` 
              : `text-${severity}-500`
          }`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {headline}
          </h3>
          <p className={`text-sm leading-relaxed ${
            isDark ? 'text-white/70' : 'text-gray-600'
          }`}>
            {subhead}
          </p>
        </div>
      </div>

      {/* Evidence Thumbnail */}
      {evidence?.thumbnail && (
        <div className={`mb-4 rounded-lg overflow-hidden border ${
          isDark ? 'border-white/20' : 'border-gray-200'
        }`}>
          <img
            src={evidence.thumbnail}
            alt={evidence.description || 'Evidence'}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Metrics */}
      <div className={`flex items-center gap-4 mb-4 text-sm ${
        isDark ? 'text-white/80' : 'text-gray-700'
      }`}>
        {impact && (
          <div className="flex items-center gap-1">
            <span className={isDark ? 'text-white/60' : 'text-gray-500'}>Impact:</span>
            <span className={`font-semibold ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              ${(impact / 1000).toFixed(1)}K/mo
            </span>
          </div>
        )}
        {effort && (
          <div className="flex items-center gap-1">
            <span className={isDark ? 'text-white/60' : 'text-gray-500'}>Fix in:</span>
            <span className={`font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {effort}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className={`flex items-center gap-2 pt-4 border-t ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                action.variant === 'primary'
                  ? isDark
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  : isDark
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {action.label}
              {action.variant === 'primary' && (
                <ArrowRight className="inline-block w-4 h-4 ml-1" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

