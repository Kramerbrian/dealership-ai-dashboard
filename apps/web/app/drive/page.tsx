'use client'

import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { triggerEasterEgg } from '@/lib/p13n/engine'
import PulseCard from '@/components/clay/PulseCard'
import FixTierDrawer from '@/components/pulse/FixTierDrawer'
import ImpactLedger from '@/components/pulse/ImpactLedger'
import ZeroClickHeat from '@/components/pulse/ZeroClickHeat'
import { rankPulse } from '@/components/pulse/PulseEngine'

export default function Drive() {
  const { user } = useUser()
  const router = useRouter()
  const role = (user?.publicMetadata?.role as any) || 'gm'
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [easterEgg, setEasterEgg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        // Get domain from sessionStorage or URL params
        const cached = sessionStorage.getItem('dai:analyzer')
        const analyzer = cached ? JSON.parse(cached) : null
        const domain = analyzer?.domain || new URLSearchParams(window.location.search).get('domain') || undefined

        // Fetch pulse snapshot from API
        const url = new URL('/api/pulse/snapshot', window.location.origin)
        if (domain) url.searchParams.set('domain', domain)

        const response = await fetch(url.toString(), {
          cache: 'no-store',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch pulses: ${response.statusText}`)
        }

        const data = await response.json()
        const pulses = data?.snapshot?.pulses || []

        // Merge with bootstrap issues if available
        const bootstrap = (analyzer?.issues || [])
          .slice(0, 3)
          .map(seedFromIssue)

        setFeed([...bootstrap, ...pulses])
      } catch (error) {
        console.error('Failed to load pulses:', error)
        // Fallback to bootstrap only
        const cached = sessionStorage.getItem('dai:analyzer')
        const analyzer = cached ? JSON.parse(cached) : null
        const bootstrap = (analyzer?.issues || [])
          .slice(0, 3)
          .map(seedFromIssue)
        setFeed(bootstrap)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const ranked = useMemo(() => rankPulse(feed as any, role as any), [feed, role])

  function openFix(p: any) {
    setPreview({
      summary: p.title,
      diff: p.diagnosis + '\n\n' + p.prescription,
      risk: 'low',
      etaSeconds: p.etaSeconds,
      projectedDeltaUSD: p.impactMonthlyUSD,
    })
    setDrawerOpen(true)
  }

  async function onApply() {
    const rec = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      actor: 'human',
      action: preview.summary,
      context: 'dashboard',
      deltaUSD: preview.projectedDeltaUSD,
      undoable: true,
    }
    setLedger((x) => [rec, ...x])
    const egg = triggerEasterEgg('auto_remediation', user?.id || 'anon')
    if (egg) {
      setEasterEgg(egg)
      setTimeout(() => setEasterEgg(null), 4000)
    }
    setDrawerOpen(false)
    return { ok: true, receiptId: rec.id }
  }

  useEffect(() => {
    if (ranked.length >= 3) {
      const totalImpact = ranked
        .slice(0, 3)
        .reduce((s, p) => s + p.impactMonthlyUSD, 0)
      if (totalImpact > 15000) {
        const egg = triggerEasterEgg('deep_insight', user?.id || 'anon')
        if (egg) {
          setEasterEgg(egg)
          setTimeout(() => setEasterEgg(null), 4000)
        }
      }
    }
  }, [ranked, user])

  // Map pulse kind to severity
  const getSeverity = (kind: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (kind === 'schema' || kind === 'faq') return 'critical'
    if (kind === 'reviews' || kind === 'ugc') return 'high'
    if (kind === 'traffic' || kind === 'funnel') return 'medium'
    return 'low'
  }

  // Format effort time
  const formatEffort = (etaSeconds: number): string => {
    const minutes = Math.round(etaSeconds / 60)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
          <span className="text-white/90 font-medium">DealershipAI • Drive</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            Onboarding
          </button>
        </div>
      </header>

      {easterEgg && (
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white/80 italic backdrop-blur-sm">
            {easterEgg}
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/10 rounded w-full mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : ranked.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-white/60">No pulse recommendations available</p>
              <p className="text-white/40 text-sm mt-2">
                Complete onboarding to start receiving AI-powered insights
              </p>
            </div>
          ) : (
            ranked.map((p) => (
              <PulseCard
                key={p.id}
                headline={p.title}
                subhead={p.diagnosis}
                impact={p.impactMonthlyUSD}
                effort={formatEffort(p.etaSeconds)}
                severity={getSeverity(p.kind)}
                actions={[
                  {
                    label: 'Fix',
                    onClick: () => openFix(p),
                    variant: 'primary',
                  },
                  {
                    label: 'Explain',
                    onClick: () => {
                      // TODO: Open explanation modal
                      console.log('Explain:', p)
                    },
                    variant: 'secondary',
                  },
                ]}
                className="bg-white/5 border-white/10 backdrop-blur-sm"
              />
            ))
          )}
        </div>

        {drawerOpen && preview && (
          <FixTierDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            preview={preview}
            onApply={onApply}
            onAutopilot={async () => ({ ok: true })}
            onUndo={async () => ({ ok: true })}
          />
        )}

        <ZeroClickHeat 
          cells={[
            {pillar:'Sales',device:'Mobile',exposurePct:72,verified:true},
            {pillar:'Sales',device:'Desktop',exposurePct:64,verified:false},
            {pillar:'Service',device:'Mobile',exposurePct:48,verified:false},
            {pillar:'Service',device:'Desktop',exposurePct:52,verified:true},
            {pillar:'Parts',device:'Mobile',exposurePct:31,verified:false},
            {pillar:'Parts',device:'Desktop',exposurePct:36,verified:false}
          ]} 
          onCellClick={(c)=>console.log("AIO cell",c)} 
        />

        <div className="hidden lg:block">
          <ImpactLedger receipts={ledger} onExport={(fmt)=>console.log("export",fmt)} />
        </div>
      </section>
    </main>
  )
}

function seedFromIssue(i: any) {
  return {
    id: i.id || crypto.randomUUID(),
    title: i.title || 'Missing schema',
    diagnosis: i.diagnosis || "AI can't cite.",
    prescription: i.prescription || 'Add schema.',
    impactMonthlyUSD: i.impact || 8200,
    etaSeconds: 90,
    confidenceScore: 0.86,
    recencyMinutes: 14,
    kind: 'schema',
  }
}

