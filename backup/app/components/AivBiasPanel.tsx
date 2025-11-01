'use client'

import { useState, useEffect } from 'react'

interface AIVBiasData {
  chatgpt: number
  gemini: number
  perplexity: number
  copilot: number
  iqr_mean: number
  spread: number
}

export default function AivBiasPanel({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<AIVBiasData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    setData({
      chatgpt: 45,
      gemini: 38,
      perplexity: 52,
      copilot: 41,
      iqr_mean: 44,
      spread: 14
    })
    setLoading(false)
  }, [tenantId])

  if (loading) {
    return (
      <div className="rounded-xl border p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">AI Visibility Bias</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const engines = [
    { name: 'ChatGPT', value: data.chatgpt, color: 'bg-green-500' },
    { name: 'Gemini', value: data.gemini, color: 'bg-blue-500' },
    { name: 'Perplexity', value: data.perplexity, color: 'bg-purple-500' },
    { name: 'Copilot', value: data.copilot, color: 'bg-orange-500' }
  ]

  const maxValue = Math.max(...engines.map(e => e.value))

  return (
    <div className="rounded-xl border p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">AI Visibility Bias</h3>
      
      <div className="space-y-4">
        {engines.map((engine) => (
          <div key={engine.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{engine.name}</span>
              <span className="text-sm text-gray-600">{engine.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${engine.color}`}
                style={{ width: `${(engine.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IQR Mean:</span>
            <span className="font-medium">{data.iqr_mean}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spread:</span>
            <span className="font-medium">{data.spread}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
