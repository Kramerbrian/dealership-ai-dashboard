# Integration Snippets - Cognitive Ops Platform

Quick copy-paste snippets for integrating new features into the dashboard.

---

## 1. OEL by Channel Card

```tsx
import { OELChannelsChart } from '@/app/(dashboard)/components/metrics/OELChannelsChart'

// In your dashboard page:
<OELChannelsChart domain={domain} channels={['Google Ads', 'Meta', 'Display', 'Organic']} />
```

---

## 2. Fix Pack ROI Panel

```tsx
import { FixPackROIPanel } from '@/app/(dashboard)/components/metrics/FixPackROIPanel'

// In your dashboard page:
<FixPackROIPanel dealerId={dealerId} />
```

---

## 3. Scan Summary Modal (Auto-trigger on completion)

```tsx
'use client'

import { useEffect, useState } from 'react'
import ScanSummaryModal from '@/app/(dashboard)/components/core/ScanSummaryModal'
import { useScanSSE } from '@/app/(dashboard)/hooks/useScanSSE'

export function DashboardWithScan() {
  const [showSummary, setShowSummary] = useState(false)
  const { start, running, summary } = useScanSSE(domain)

  useEffect(() => {
    if (summary && !running) {
      // Auto-show modal when scan completes
      setShowSummary(true)
    }
  }, [summary, running])

  return (
    <>
      <button onClick={start} disabled={running}>
        {running ? 'Scanning...' : 'Start Scan'}
      </button>

      <ScanSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        onOpenRAR={() => {
          // Open Revenue at Risk modal
          setShowSummary(false)
          // Trigger RAR modal
        }}
        onOpenQAI={() => {
          // Open QAI modal
          setShowSummary(false)
          // Trigger QAI modal
        }}
        summary={summary}
      />
    </>
  )
}
```

---

## 4. PIQR with OEL Integration

```tsx
'use client'

import { usePIQR } from '@/app/(dashboard)/hooks/usePIQR'
import { useOELChannels } from '@/app/(dashboard)/hooks/useOELChannels'

export function PIQRCard({ dealerId, domain }: { dealerId: string; domain?: string }) {
  const { data: oelChannels } = useOELChannels(domain)
  const { data: piqr, loading } = usePIQR({
    dealerId,
    domain,
    oelByChannel: oelChannels?.channels?.map(c => ({
      name: c.name,
      oel: c.oel,
      efficiencyScore: c.efficiencyScore,
    })),
  })

  if (loading) return <div>Calculating PIQR...</div>
  if (!piqr) return null

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">Performance Impact Quality Risk (PIQR)</div>
      <div className={`text-2xl font-bold ${riskColors[piqr.riskLevel]}`}>
        {piqr.piqr.toFixed(3)}
      </div>
      <div className="text-xs text-gray-500 mt-1">Risk Level: {piqr.riskLevel}</div>
      
      {piqr.riskDrivers.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-600 mb-2">Top Risk Drivers</div>
          {piqr.riskDrivers.slice(0, 3).map((driver, i) => (
            <div key={i} className="text-xs flex justify-between">
              <span>{driver.factor}</span>
              <span className="font-medium">{(driver.impact * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 5. Decision Feed Integration

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useOELChannels } from '@/app/(dashboard)/hooks/useOELChannels'
import { usePIQR } from '@/app/(dashboard)/hooks/usePIQR'

export function DecisionFeed({ dealerId, domain }: { dealerId: string; domain?: string }) {
  const { data: channels } = useOELChannels(domain)
  const { data: piqr } = usePIQR({
    dealerId,
    domain,
    oelByChannel: channels?.channels?.map(c => ({
      name: c.name,
      oel: c.oel,
      efficiencyScore: c.efficiencyScore,
    })),
  })

  const [decisions, setDecisions] = useState<Array<{
    id: string
    type: 'oel_alert' | 'piqr_warning' | 'fix_pack_success'
    message: string
    timestamp: Date
    action?: string
  }>>([])

  useEffect(() => {
    const newDecisions: typeof decisions = []

    // OEL alerts
    if (channels?.totals.oel && channels.totals.oel > 20000) {
      newDecisions.push({
        id: 'oel-1',
        type: 'oel_alert',
        message: `High OEL detected: $${channels.totals.oel.toLocaleString()}`,
        timestamp: new Date(),
        action: 'Review channel efficiency',
      })
    }

    // PIQR warnings
    if (piqr && piqr.riskLevel === 'high' || piqr?.riskLevel === 'critical') {
      newDecisions.push({
        id: 'piqr-1',
        type: 'piqr_warning',
        message: `PIQR Risk Level: ${piqr.riskLevel} (${piqr.piqr.toFixed(3)})`,
        timestamp: new Date(),
        action: piqr.recommendations[0]?.action,
      })
    }

    setDecisions(newDecisions)
  }, [channels, piqr])

  if (decisions.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">No active decisions</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="text-sm font-medium mb-3">Decision Feed</div>
      <div className="space-y-2">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className={`p-3 rounded-lg border ${
              decision.type === 'oel_alert'
                ? 'bg-red-50 border-red-200'
                : decision.type === 'piqr_warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="text-sm font-medium">{decision.message}</div>
            {decision.action && (
              <div className="text-xs text-gray-600 mt-1">Action: {decision.action}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {decision.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 6. Voice Integration (HAL Personality)

```tsx
'use client'

import { useOELChannels } from '@/app/(dashboard)/hooks/useOELChannels'
import { usePIQR } from '@/app/(dashboard)/hooks/usePIQR'

export function HALVoiceIntegration({ dealerId, domain }: { dealerId: string; domain?: string }) {
  const { data: channels } = useOELChannels(domain)
  const { data: piqr } = usePIQR({ dealerId, domain })

  useEffect(() => {
    if (!channels || !piqr) return

    // Generate HAL-style message based on data
    let message = ''

    if (channels.totals.oel > 20000) {
      message = `I've detected high Opportunity Efficiency Loss: $${channels.totals.oel.toLocaleString()}. This requires attention.`
    } else if (piqr.riskLevel === 'high' || piqr.riskLevel === 'critical') {
      message = `PIQR risk level is ${piqr.riskLevel}. Consider reviewing the recommended actions.`
    } else {
      message = 'All systems nominal. OEL and PIQR are within acceptable ranges.'
    }

    // Dispatch custom event for HAL to speak
    const event = new CustomEvent('hal-message', {
      detail: { message, type: 'insight' },
    })
    window.dispatchEvent(event)
  }, [channels, piqr])

  return null // This is a side-effect component
}
```

---

## 7. Complete Dashboard Integration

```tsx
'use client'

import { OELChannelsChart } from '@/app/(dashboard)/components/metrics/OELChannelsChart'
import { FixPackROIPanel } from '@/app/(dashboard)/components/metrics/FixPackROIPanel'
import { PIQRCard } from './PIQRCard'
import { DecisionFeed } from './DecisionFeed'
import ScanSummaryModal from '@/app/(dashboard)/components/core/ScanSummaryModal'
import { useScanSSE } from '@/app/(dashboard)/hooks/useScanSSE'

export function EnhancedDashboard({ dealerId, domain }: { dealerId: string; domain: string }) {
  const [showScanSummary, setShowScanSummary] = useState(false)
  const { start, running, summary } = useScanSSE(domain)

  useEffect(() => {
    if (summary && !running) {
      setShowScanSummary(true)
    }
  }, [summary, running])

  return (
    <div className="space-y-6 p-6">
      {/* OEL by Channel */}
      <OELChannelsChart domain={domain} />

      {/* Fix Pack ROI */}
      <FixPackROIPanel dealerId={dealerId} />

      {/* PIQR with OEL */}
      <PIQRCard dealerId={dealerId} domain={domain} />

      {/* Decision Feed */}
      <DecisionFeed dealerId={dealerId} domain={domain} />

      {/* Scan Summary Modal */}
      <ScanSummaryModal
        open={showScanSummary}
        onClose={() => setShowScanSummary(false)}
        onOpenRAR={() => {
          // Open RAR modal
        }}
        onOpenQAI={() => {
          // Open QAI modal
        }}
        summary={summary}
      />
    </div>
  )
}
```

---

*Copy these snippets directly into your components for instant integration.*

