'use client'

import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { triggerEasterEgg } from '@/lib/p13n/engine'

export default function Drive() {
  const { user } = useUser()
  const router = useRouter()
  const role = (user?.publicMetadata?.role as any) || 'gm'
  const [feed, setFeed] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [easterEgg, setEasterEgg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const cached = sessionStorage.getItem('dai:analyzer')
      const analyzer = cached ? JSON.parse(cached) : null
      const bootstrap = (analyzer?.issues || [])
        .slice(0, 3)
        .map(seedFromIssue)
      const server = await fetch('/api/pulse/snapshot', {
        cache: 'no-store',
      })
        .then((r) => r.json())
        .catch(() => [])
      setFeed([...bootstrap, ...server])
    })()
  }, [])

  const ranked = useMemo(() => rankPulse(feed, role), [feed, role])

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

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-white" />
          <span className="text-white/80">DealershipAI•Drive</span>
        </div>
        <button
          onClick={() => router.push('/onboarding')}
          className="px-4 py-2 rounded-full border border-white/20"
        >
          Onboarding
        </button>
      </header>

      {easterEgg && (
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white/80 italic">
            {easterEgg}
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        <div className="space-y-4">
          {ranked.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="bg-white/2 border border-white/10 rounded-lg p-5"
            >
              <div className="text-lg">{p.title}</div>
              <div className="text-sm text-white/60 mt-1">{p.diagnosis}</div>
              <div className="text-sm text-white mt-2">{p.prescription}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm">
                  Impact: ${(p.impactMonthlyUSD / 1000).toFixed(1)}K/mo • ~
                  {Math.round(p.etaSeconds / 60)}min
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openFix(p)}
                    className="px-4 py-2 rounded-full bg-white text-black"
                  >
                    Fix
                  </button>
                  <button className="px-4 py-2 rounded-full border border-white/20">
                    Explain
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {drawerOpen && (
          <FixDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            preview={preview}
            onApply={onApply}
          />
        )}

        <div className="hidden lg:block">
          <Ledger receipts={ledger} />
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

function rankPulse(feed: any[], role: string) {
  return feed.sort(
    (a, b) =>
      (b.impactMonthlyUSD / b.etaSeconds) * b.confidenceScore -
      (a.impactMonthlyUSD / a.etaSeconds) * a.confidenceScore
  )
}

function FixDrawer({ open, onClose, preview, onApply }: any) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black rounded-2xl p-6 max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-3">{preview.summary}</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {preview.diff}
        </pre>
        <div className="mt-4 flex gap-3">
          <button
            onClick={onApply}
            className="px-6 py-3 rounded-lg bg-black text-white"
          >
            Apply
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-lg border">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function Ledger({ receipts }: any) {
  return (
    <div className="border border-white/10 rounded-lg p-5">
      <div className="text-white/80 font-semibold mb-3">Impact Ledger</div>
      {receipts.length === 0 ? (
        <div className="text-white/50 text-sm">No actions yet</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {receipts.map((r: any) => (
            <li key={r.id} className="border-b border-white/10 pb-2">
              <div className="text-white/80">{r.action}</div>
              <div className="text-white/50">
                ${(r.deltaUSD / 1000).toFixed(1)}K/mo •{' '}
                {new Date(r.ts).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
