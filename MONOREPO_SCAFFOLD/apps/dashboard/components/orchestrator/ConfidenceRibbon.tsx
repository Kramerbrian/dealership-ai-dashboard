'use client'

import { useEffect, useState } from 'react'
import type { KPIMetrics } from '@dealershipai/shared'

export function ConfidenceRibbon() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null)

  useEffect(() => {
    fetch('/api/ai-scores')
      .then((res) => res.json())
      .then((data) => setMetrics(data.metrics))
      .catch(console.error)

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/ai-scores')
        .then((res) => res.json())
        .then((data) => setMetrics(data.metrics))
        .catch(console.error)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!metrics) {
    return (
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-3">
        <div className="text-sm text-gray-500">Loading metrics...</div>
      </div>
    )
  }

  const overallConfidence =
    (metrics.aiv +
      metrics.qai +
      (1 - metrics.piqr) * 100 +
      metrics.ati +
      metrics.asrRoi) /
    5

  const getConfidenceColor = (value: number) => {
    if (value >= 85) return 'bg-green-500'
    if (value >= 65) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceTextColor = (value: number) => {
    if (value >= 85) return 'text-green-700'
    if (value >= 65) return 'text-yellow-700'
    return 'text-red-700'
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">AI CSO Confidence</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getConfidenceColor(overallConfidence)}`}
                  style={{ width: `${overallConfidence}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${getConfidenceTextColor(overallConfidence)}`}>
                {overallConfidence.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-500">AIV:</span>{' '}
              <span className="font-semibold">{metrics.aiv.toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-500">QAI:</span>{' '}
              <span className="font-semibold">{metrics.qai.toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-500">PIQR:</span>{' '}
              <span className="font-semibold">{metrics.piqr.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">OCI:</span>{' '}
              <span className="font-semibold">${(metrics.oci / 1000).toFixed(0)}K</span>
            </div>
            <div>
              <span className="text-gray-500">ATI:</span>{' '}
              <span className="font-semibold">{metrics.ati.toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-500">ASR-ROI:</span>{' '}
              <span className="font-semibold">{metrics.asrRoi.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

