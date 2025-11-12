'use client'

import { useState, useEffect } from 'react'

export type PIQRResult = {
  piqr: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskDrivers: Array<{
    factor: string
    impact: number
    weight: number
  }>
  recommendations: Array<{
    action: string
    priority: 'high' | 'medium' | 'low'
    expectedImpact: number
  }>
}

export type PIQRInput = {
  dealerId: string
  domain?: string
  oel?: number
  oelByChannel?: Array<{
    name: string
    oel: number
    efficiencyScore: number
  }>
  aiv?: number
  qai?: number
  schemaCoverage?: number
  geoIntegrity?: number
}

export function usePIQR(input: PIQRInput | null) {
  const [data, setData] = useState<PIQRResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!input || !input.dealerId) return

    let alive = true
    setLoading(true)
    setError(null)

    fetch('/api/metrics/piqr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (alive && json.success) {
          setData(json.result)
        }
      })
      .catch((e: any) => {
        if (alive) setError(e?.message || 'Failed to calculate PIQR')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [input?.dealerId, input?.domain, input?.oel])

  return { data, loading, error }
}

