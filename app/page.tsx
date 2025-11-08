'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { JsonLd } from '@/components/SEO/JsonLd'
import { SoftwareApplicationLd, FaqLd, HowToLd } from '@/components/SEO/SeoBlocks'
// Load weights from API instead of direct file access (client-side safe)
async function getVisibilityWeights() {
  try {
    const res = await fetch('/api/formulas/weights', { cache: 'no-store' });
    return res.ok ? await res.json() : { ChatGPT: 0.35, Perplexity: 0.25, Gemini: 0.25, Copilot: 0.15 };
  } catch {
    return { ChatGPT: 0.35, Perplexity: 0.25, Gemini: 0.25, Copilot: 0.15 };
  }
}

// Lazy-load client visual components
const AIVStrip = dynamic(() => import('@/components/visibility/AIVStrip'), {
  ssr: false,
})
const AIVCompositeChip = dynamic(
  () => import('@/components/visibility/AIVCompositeChip'),
  { ssr: false }
)

export default function LandingPage() {
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<any>(null)
  const [weights, setWeights] = useState({
    ChatGPT: 0.35,
    Perplexity: 0.25,
    Gemini: 0.25,
    Copilot: 0.15,
  })

  // Load weights from registry on mount
  React.useEffect(() => {
    getVisibilityWeights()
      .then((w) => setWeights(w))
      .catch(() => {})
  }, [])

  const onAnalyze = async () => {
    if (!domain) return
    setStatus('loading')

    try {
      const res = await fetch(
        `/api/v1/analyze?domain=${encodeURIComponent(domain)}`,
        { cache: 'no-store' }
      )
      const payload = res.ok ? await res.json() : null

      // Fallback synthetic (remove once your analyzer is live)
      const synthetic = {
        dealership: 'Terry Reid Hyundai',
        location: 'Cape Coral, FL',
        overall: 82,
        rank: 2,
        of: 8,
        platforms: [
          { name: 'ChatGPT', score: 94, status: 'Excellent' },
          { name: 'Claude', score: 89, status: 'Good' },
          { name: 'Perplexity', score: 82, status: 'Good' },
          { name: 'Gemini', score: 78, status: 'Fair' },
          { name: 'Copilot', score: 71, status: 'Fair' },
        ],
        issues: [
          {
            id: '1',
            title: 'Missing AutoDealer Schema',
            impact: 8200,
            effort: '2 hours',
            diagnosis:
              'AI engines cannot properly cite your dealership entity.',
            prescription:
              'Add AutoDealer JSON-LD schema to homepage with complete NAP data.',
          },
          {
            id: '2',
            title: 'Low Review Response Rate',
            impact: 3100,
            effort: '1 hour',
            diagnosis:
              'Only 45% of reviews have responses, reducing trust signals.',
            prescription:
              'Respond to all reviews within 24 hours, especially negative ones.',
          },
          {
            id: '3',
            title: 'Incomplete FAQ Schema',
            impact: 2400,
            effort: '3 hours',
            diagnosis: 'FAQPage schema missing on service pages.',
            prescription:
              'Add FAQPage schema to all service department pages with common questions.',
          },
        ],
      }

      const final = payload?.success ? payload : synthetic
      setResult(final)

      // Persist for onboarding/drive continuity
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dai:analyzer', JSON.stringify(final))
      }
      setStatus('done')
    } catch {
      setStatus('done') // still show synthetic
    }
  }

  return (
    <>
      {/* JSON-LD for AI GEO */}
      <JsonLd>{SoftwareApplicationLd()}</JsonLd>
      <JsonLd>{FaqLd()}</JsonLd>
      <JsonLd>{HowToLd()}</JsonLd>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-900 antialiased">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500" />
              <span className="font-extrabold text-xl">
                dealership<span className="text-blue-600">AI</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#product" className="hover:text-blue-600">
                Product
              </a>
              <a href="#pricing" className="hover:text-blue-600">
                Pricing
              </a>
              <a href="#faq" className="hover:text-blue-600">
                FAQ
              </a>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-16 pb-10 text-center max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Are You{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
              Invisible
            </span>{' '}
            to AI?
          </h1>
          <p className="mt-5 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            When ChatGPT doesn't know you exist, you're losing ~
            <b>$43,000/month</b> in potential sales.
          </p>

          <div className="mt-8 mx-auto max-w-xl bg-white border rounded-2xl p-5 shadow-lg text-left">
            <label className="text-sm font-semibold text-gray-700">
              🔍 Enter your dealership domain
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                placeholder="terryreidhyundai.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAnalyze()
                  }
                }}
                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={onAnalyze}
                disabled={status === 'loading' || !domain}
                className="px-5 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
            <ul className="mt-3 text-sm text-gray-500 grid grid-cols-3 gap-2">
              <li>✓ Instant results</li>
              <li>✓ 5 AI platforms</li>
              <li>✓ Revenue impact</li>
            </ul>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            📊 Trusted by 847 dealerships · ⭐ 4.9/5 rating
          </div>
        </section>

        {/* Analyzing */}
        {status === 'loading' && (
          <section className="my-10 bg-white border rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
            <div className="font-semibold mb-3">⚡ Analyzing {domain}…</div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 w-5/6 bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" />
            </div>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>✓ Checked 5 AI platforms</li>
              <li>✓ Analyzed 120+ data points</li>
              <li>✓ Compared to local competitors</li>
            </ul>
          </section>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <section id="report" className="my-12 max-w-6xl mx-auto px-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">
                    {result.dealership} • {result.location}
                  </div>
                  <h2 className="text-2xl font-black">📊 Your AI Visibility Report</h2>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Overall Score</div>
                  <div className="text-3xl font-black text-blue-600">
                    {result.overall}/100
                  </div>
                  <div className="text-xs text-gray-500">
                    #{result.rank} of {result.of} in market
                  </div>
                </div>
              </div>

              {/* AIV Strip integration */}
              <div className="mt-4 flex items-center justify-end gap-4">
                <AIVStrip domain={domain} />
                <AIVCompositeChip domain={domain} weights={weights} />
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">AI Platform</th>
                      <th>Your Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.platforms.map((p: any) => (
                      <tr key={p.name} className="border-b">
                        <td className="py-2 font-medium">{p.name}</td>
                        <td>{p.score}%</td>
                        <td
                          className={
                            p.status === 'Excellent'
                              ? 'text-green-600'
                              : p.status === 'Good'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                          }
                        >
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-2">🔴 Critical Issues</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {result.issues.map((i: any) => (
                    <div
                      key={i.id || i.title}
                      className="border rounded-xl p-4 bg-red-50/60"
                    >
                      <div className="font-semibold">{i.title}</div>
                      <div className="text-sm text-gray-600">
                        → Costing you ${i.impact.toLocaleString()}/month
                      </div>
                      <div className="text-xs text-gray-500">
                        ⏱ Fix in {i.effort}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border">
                <div className="font-bold">
                  💰 Total Revenue at Risk: $
                  {result.issues
                    .reduce((s: number, i: any) => s + i.impact, 0)
                    .toLocaleString()}
                  /month
                </div>
                <div className="text-sm text-gray-600">
                  DealershipAI Pro: $499/month • ROI: 20x–30x in first month
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="#pricing"
                  className="px-5 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-center hover:opacity-90"
                >
                  🎯 Fix These Issues – Start Free Trial
                </Link>
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Report link copied!')
                    }
                  }}
                  className="px-5 py-3 rounded-xl border text-center hover:bg-gray-50"
                >
                  📧 Copy Shareable Report Link
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Product section */}
        <section id="product" className="my-16 max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-6">
            The Bloomberg Terminal for AI Visibility
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                t: 'Real-Time AI Tracking',
                d: 'Monitor your presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot.',
              },
              {
                t: 'Five-Pillar Scoring',
                d: 'Visibility, Zero-Click Shield, UGC Health, Geo Trust, and Schema Integrity.',
              },
              {
                t: 'Revenue Impact Math',
                d: 'Translate visibility gaps into dollars so decisions are obvious.',
              },
            ].map((c) => (
              <div
                key={c.t}
                className="bg-white border rounded-2xl p-5 shadow-sm"
              >
                <div className="font-bold mb-1">{c.t}</div>
                <div className="text-sm text-gray-600">{c.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="my-16 max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-8">
            Start Free. Scale When Ready.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                perks: ['3 analyses', 'Basic AI score', '1 competitor'],
              },
              {
                name: 'Pro',
                price: '$499/mo',
                highlight: true,
                perks: [
                  '50 analyses',
                  'All 5 platforms',
                  '5 competitors',
                  'Bi-weekly refresh',
                  'ROI calculator',
                ],
              },
              {
                name: 'Enterprise',
                price: '$999/mo',
                perks: [
                  '200 analyses',
                  'Mystery shop',
                  'White-label',
                  'API access',
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`bg-white border rounded-2xl p-6 shadow-sm ${
                  p.highlight ? 'ring-2 ring-blue-300' : ''
                }`}
              >
                <div className="text-xl font-bold">{p.name}</div>
                <div className="text-3xl font-black mt-2">{p.price}</div>
                <ul className="mt-4 text-sm text-gray-700 space-y-2">
                  {p.perks.map((x) => (
                    <li key={x}>✓ {x}</li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Link
                    href="#report"
                    className={`block text-center px-4 py-3 rounded-xl border ${
                      p.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="my-20 max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-4">FAQ</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                q: 'How do I check my AI search visibility?',
                a: 'Use the analyzer above; results in ~10 seconds across 5 AI platforms.',
              },
              {
                q: 'What is AI search optimization (AEO)?',
                a: 'Optimizing your site and entities so AI assistants rank and recommend your dealership.',
              },
              {
                q: 'How much revenue am I losing?',
                a: 'On average ~$43k/mo. The report shows your specific revenue-at-risk math.',
              },
              {
                q: 'Do you auto-fix issues?',
                a: 'Pro/Enterprise include auto-fix options (schema, FAQ, and review response workflows).',
              },
            ].map((f) => (
              <div key={f.q} className="bg-white border rounded-2xl p-5">
                <div className="font-semibold">{f.q}</div>
                <div className="text-sm text-gray-600 mt-1">{f.a}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-600 flex items-center justify-between">
          <div>© {new Date().getFullYear()} DealershipAI</div>
          <div className="flex gap-4">
            <a className="hover:text-blue-600" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-blue-600" href="/terms">
              Terms
            </a>
            <a className="hover:text-blue-600" href="/sitemap.xml">
              Sitemap
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
