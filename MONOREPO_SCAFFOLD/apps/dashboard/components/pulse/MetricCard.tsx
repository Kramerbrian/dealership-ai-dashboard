'use client'

import { useEffect, useState } from 'react'
import type { KPIMetrics } from '@dealershipai/shared'

interface MetricCardProps {
  metric: 'aiv' | 'qai' | 'piqr' | 'oci' | 'ati' | 'asr_roi'
}

const metricLabels: Record<string, string> = {
  aiv: 'AI Visibility',
  qai: 'Quality Authority Index',
  piqr: 'Performance Impact Quality Risk',
  oci: 'Opportunity Cost of Inaction',
  ati: 'Algorithmic Trust Index',
  asr_roi: 'ASR ROI',
}

export function MetricCard({ metric }: MetricCardProps) {
  const [value, setValue] = useState<number>(0)

  useEffect(() => {
    fetch('/api/ai-scores')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) {
          setValue(data.metrics[metric] || 0)
        }
      })
      .catch(console.error)
  }, [metric])

  const formatValue = (val: number, metric: string) => {
    if (metric === 'oci') {
      return `$${(val / 1000).toFixed(0)}K`
    }
    if (metric === 'piqr') {
      return val.toFixed(2)
    }
    return `${val.toFixed(0)}%`
  }

  const getColor = (val: number, metric: string) => {
    if (metric === 'piqr') {
      // Lower is better for PIQR
      return val < 0.15 ? 'text-green-600' : val < 0.3 ? 'text-yellow-600' : 'text-red-600'
    }
    // Higher is better for others
    return val >= 85 ? 'text-green-600' : val >= 65 ? 'text-yellow-600' : 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-600 mb-1">{metricLabels[metric]}</div>
      <div className={`text-2xl font-bold ${getColor(value, metric)}`}>
        {formatValue(value, metric)}
      </div>
    </div>
  )
}

