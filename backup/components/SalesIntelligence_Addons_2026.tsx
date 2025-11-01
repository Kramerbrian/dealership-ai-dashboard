'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, ShieldAlert, PlayCircle, Gauge, TrendingUp, Users, Target } from 'lucide-react'

export type HRPState = {
  value: number
  lastUpdated: string
  blocking: boolean
}

export type AcquisitionKPIs = {
  a2s: number
  tradeCapture: number
  missedTrades: number
  ae: number
  period: string
}

export function useTierFeatures() {
  const ctx = (typeof window !== 'undefined' ? (window as any).__ctx : { plan: 'ignition', role: 'dealer_user' })
  const isTier3 = ctx?.plan === 'hyperdrive'
  const canAdmin = ['admin', 'superadmin'].includes(ctx?.role)
  return { isTier3, canAdmin }
}

export function RedBannerGovernance() {
  const { isTier3, canAdmin } = useTierFeatures()
  const [hrp, setHrp] = useState<HRPState>({
    value: 0.12,
    lastUpdated: new Date().toISOString(),
    blocking: false
  })
  
  const band: 'ok' | 'warn' | 'crit' = hrp.value >= 0.75 ? 'crit' : hrp.value >= 0.5 ? 'warn' : 'ok'

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/hrp-state', { cache: 'no-store' })
        if (r.ok) setHrp(await r.json())
      } catch {
        // Fallback to default state
      }
    })()
  }, [])

  if (!isTier3) return null

  const banner = band === 'crit' 
    ? 'border-red-600 bg-red-950/50' 
    : band === 'warn' 
    ? 'border-amber-600 bg-amber-950/40' 
    : 'border-emerald-600 bg-emerald-950/30'

  async function toggleBlock(next: boolean) {
    try {
      const r = await fetch('/api/hrp-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocking: next })
      })
      if (r.ok) setHrp(await r.json())
    } catch {
      // Handle error
    }
  }

  async function runFactCheck() {
    await fetch('/api/agents/run-playbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'HRP Fact-Check & Schema Revalidate' })
    })
  }

  return (
    <div className={`rounded-xl border ${banner} p-4 space-y-3`}>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-2'>
          {band === 'crit' ? <ShieldAlert className='h-5 w-5' /> : <AlertTriangle className='h-5 w-5' />}
          <div>
            <div className='font-semibold'>AI Accuracy Risk {(hrp.value * 100).toFixed(0)}%</div>
            <div className='text-xs text-gray-400'>
              Last updated {new Date(hrp.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
        {canAdmin && (
          <div className='flex gap-2'>
            {!hrp.blocking && band !== 'ok' && (
              <button 
                onClick={() => toggleBlock(true)} 
                className='px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm'
              >
                Pause auto-replies
              </button>
            )}
            {hrp.blocking && (
              <button 
                onClick={() => toggleBlock(false)} 
                className='px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-sm'
              >
                Resume auto-replies
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className='grid sm:grid-cols-3 gap-2'>
        <div className='rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm'>
          <div className='text-gray-400'>Policy</div>
          <div>≥0.75: pause · ≥0.50: red-flag/human review · else: normal.</div>
        </div>
        <div className='rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm'>
          <div className='text-gray-400'>Next Action</div>
          <div>Run fact-check + schema revalidate for price/warranty.</div>
        </div>
        <div className='rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm'>
          <div className='text-gray-400'>Status</div>
          <div>{hrp.blocking ? 'Auto-replies paused' : 'Auto-replies active'}</div>
        </div>
      </div>
      
      <div className='flex gap-2'>
        <button 
          onClick={runFactCheck} 
          className='px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm flex items-center gap-1'
        >
          <PlayCircle className='h-4 w-4' />
          Run Fact-Check
        </button>
        <button 
          onClick={() => window.open('/settings', '_self')} 
          className='px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm'
        >
          Approval Rules
        </button>
      </div>
    </div>
  )
}

export function AcquisitionKPIPanel() {
  const [k, setK] = useState<AcquisitionKPIs>({
    a2s: 88,
    tradeCapture: 62,
    missedTrades: 14,
    ae: 79,
    period: 'Last 30 days'
  })

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/acquisition-kpis', { cache: 'no-store' })
        if (r.ok) setK(await r.json())
      } catch {
        // Fallback to default state
      }
    })()
  }, [])

  const tone = (v: number) => v >= 80 ? 'text-emerald-400' : v >= 65 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='font-semibold'>Used Vehicle Acquisition</div>
        <div className='text-xs text-gray-500'>{k.period}</div>
      </div>
      
      <div className='grid sm:grid-cols-4 gap-3'>
        <CS l='Appraisals → Sales (A2S %)' v={`${k.a2s.toFixed(0)}%`} t={tone(k.a2s)} />
        <CS l='Trade Capture %' v={`${k.tradeCapture.toFixed(0)}%`} t={tone(k.tradeCapture)} />
        <CS l='Missed Trades %' v={`${k.missedTrades.toFixed(0)}%`} t={
          k.missedTrades <= 15 ? 'text-emerald-400' : 
          k.missedTrades <= 25 ? 'text-yellow-400' : 'text-red-400'
        } />
        <div className='rounded-lg border border-gray-100 p-3'>
          <div className='text-xs text-gray-500 mb-1 flex items-center gap-1'>
            <Gauge className='h-3 w-3' />
            Acquisition Efficiency
          </div>
          <div className={`text-3xl font-bold ${tone(k.ae)}`}>{k.ae.toFixed(0)}</div>
          <div className='text-xs text-gray-500'>(A2S×0.4 + Capture×0.4 − Missed×0.2)</div>
        </div>
      </div>
      
      <div className='grid sm:grid-cols-3 gap-2'>
        <AB l='Boost Trade Capture' n='Playbook: Recover Missed Trades' />
        <AB l='Tighten Offer Integrity' n='Agent: Offer Integrity Diff Scan' />
        <AB l='Service Drive Prospecting' n='Playbook: Convert RO → Appraisal' />
      </div>
    </div>
  )
}

function CS({ l, v, t }: { l: string; v: string; t: string }) {
  return (
    <div className='rounded-lg border border-gray-100 p-3'>
      <div className='text-xs text-gray-500 mb-1'>{l}</div>
      <div className={`text-3xl font-bold ${t}`}>{v}</div>
    </div>
  )
}

async function q(name: string) {
  await fetch('/api/agents/run-playbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
}

function AB({ l, n }: { l: string; n: string }) {
  return (
    <button 
      onClick={() => q(n)} 
      className='rounded-lg border border-gray-200 bg-white hover:bg-gray-50 p-3 text-sm'
    >
      {l}
    </button>
  )
}

export default function _() {
  return null
}
