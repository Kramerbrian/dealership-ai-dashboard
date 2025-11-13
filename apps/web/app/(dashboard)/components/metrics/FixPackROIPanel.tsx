'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, CheckCircle } from 'lucide-react'

interface FixPackROI {
  fixPackId: string
  dealerId: string
  appliedAt: Date
  oelBefore: number
  oelAfter: number
  oelReduction: number
  realizedDollars: number
  confidence: number
  status: 'active' | 'completed' | 'failed'
}

interface FixPackROIPanelProps {
  dealerId: string
}

export function FixPackROIPanel({ dealerId }: FixPackROIPanelProps) {
  const [data, setData] = useState<{
    fixPacks: FixPackROI[]
    summary: {
      totalFixPacks: number
      totalRealized: number
      totalReduction: number
      avgConfidence: number
    }
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dealerId) return

    setLoading(true)
    fetch(`/api/fix-pack/roi?dealerId=${encodeURIComponent(dealerId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [dealerId])

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">Loading ROI data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fix Pack ROI Monitor</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{data.summary.totalFixPacks} active fix packs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div className="text-sm text-gray-600">Total Realized</div>
          </div>
          <div className="text-2xl font-bold text-green-700">
            ${data.summary.totalRealized.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-gray-600">OEL Reduction</div>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            ${data.summary.totalReduction.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-2">Avg Confidence</div>
          <div className="text-2xl font-bold text-purple-700">
            {(data.summary.avgConfidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 mb-2">Recent Fix Packs</div>
        {data.fixPacks.map((fixPack) => (
          <div
            key={fixPack.fixPackId}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{fixPack.fixPackId}</div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  fixPack.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : fixPack.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {fixPack.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">OEL Before</div>
                <div className="font-semibold">${fixPack.oelBefore.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-600">OEL After</div>
                <div className="font-semibold text-green-600">
                  ${fixPack.oelAfter.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Realized</div>
                <div className="font-semibold text-blue-600">
                  ${fixPack.realizedDollars.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Applied</div>
                <div className="font-semibold">
                  {new Date(fixPack.appliedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

