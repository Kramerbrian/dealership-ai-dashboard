'use client'

import { useState, useEffect } from 'react'
import { getApiBase } from '@/lib/apiConfig'

export type ChannelRow = {
  name: string
  adSpend: number
  adWastePct: number
  visitors: number
  visibilityLossPct: number
  leadConvPct: number
  leadValue: number
  recovered: number
  wastedSpend: number
  lostLeadsValue: number
  oel: number
  efficiencyScore: number
}

export type OELChannelsResponse = {
  success: boolean
  domain: string
  channels: ChannelRow[]
  totals: {
    adSpend: number
    wastedSpend: number
    lostLeadsValue: number
    recovered: number
    oel: number
    visitors: number
  }
  avgEfficiencyScore: number
  timestamp: string
}

export function useOELChannels(domain?: string, channels?: string[]) {
  const [data, setData] = useState<OELChannelsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!domain) return

    let alive = true
    setLoading(true)
    setError(null)

    const channelsParam = channels?.join(',') || 'Google Ads,Meta,Display,Organic'
    const base = getApiBase()
    const url = `${base}/metrics/oel/channels?domain=${encodeURIComponent(domain)}&channels=${encodeURIComponent(channelsParam)}`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (alive) setData(json)
      })
      .catch((e: any) => {
        if (alive) setError(e?.message || 'Failed to load OEL by channel')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [domain, channels?.join(',')])

  return { data, loading, error }
}

