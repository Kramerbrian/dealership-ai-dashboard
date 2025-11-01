'use client'

import { useState, useEffect } from 'react'

interface QualityOpsData {
  qai_score: number
  vco_rating: number
  piqr_index: number
  last_updated: string
}

export default function QualityOpsSection({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<QualityOpsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    setData({
      qai_score: 87,
      vco_rating: 92,
      piqr_index: 78,
      last_updated: new Date().toISOString()
    })
    setLoading(false)
  }, [tenantId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const metrics = [
    {
      name: 'QAI Score',
      value: data.qai_score,
      description: 'Quality Assurance Index',
      color: 'bg-blue-500',
      trend: '+4.2%'
    },
    {
      name: 'VCO Rating',
      value: data.vco_rating,
      description: 'Vehicle Customer Operations',
      color: 'bg-green-500',
      trend: '+2.1%'
    },
    {
      name: 'PIQR Index',
      value: data.piqr_index,
      description: 'Product Information Quality',
      color: 'bg-purple-500',
      trend: '+1.8%'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quality Operations</h2>
        <p className="text-gray-600">Comprehensive quality metrics and performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{metric.value}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-green-600 font-medium">{metric.trend}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${metric.color}`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• High customer satisfaction scores</li>
              <li>• Excellent process efficiency</li>
              <li>• Strong quality control measures</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Response time optimization</li>
              <li>• Documentation completeness</li>
              <li>• Training program updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
