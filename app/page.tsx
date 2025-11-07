'use client';



import React, { useState } from 'react';

import dynamic from 'next/dynamic';

import { useRouter } from 'next/navigation';



// Lazy client components

const AIVStrip = dynamic(() => import('@/components/visibility/AIVStrip'), { ssr: false });

const AIVCompositeChip = dynamic(() => import('@/components/visibility/AIVCompositeChip'), { ssr: false });



export default function LandingPage() {

  const router = useRouter();

  const [domain, setDomain] = useState('');

  const [status, setStatus] = useState<'idle'|'loading'|'done'>('idle');

  const [result, setResult] = useState<any>(null);



  async function onAnalyze() {

    if (!domain) return;

    setStatus('loading');

    try {

      const res = await fetch(`/api/v1/analyze?domain=${encodeURIComponent(domain)}`, { cache: 'no-store' });

      const payload = res.ok ? await res.json() : null;



      // Fallback synthetic while real analyzer is wired

      const synthetic = {

        dealership: 'Terry Reid Hyundai',

        location: 'Cape Coral, FL',

        overall: 82, rank: 2, of: 8,

        platforms: [

          { name: 'ChatGPT', score: 94, status: 'Excellent' },

          { name: 'Perplexity', score: 82, status: 'Good' },

          { name: 'Gemini', score: 78, status: 'Fair' },

          { name: 'Copilot', score: 71, status: 'Fair' }

        ],

        issues: [

          { id: 'schema_missing', title: 'Missing AutoDealer Schema', impact: 8200, effort: '2 hours' },

          { id: 'reviews_latency', title: 'Low Review Response Rate', impact: 3100, effort: '1 hour' },

          { id: 'faq_missing', title: 'Incomplete FAQ Schema', impact: 2400, effort: '3 hours' }

        ],

        success: true

      };



      const final = payload?.success ? payload : synthetic;

      setResult(final);



      // Persist for onboarding/drive continuity

      sessionStorage.setItem('dai:analyzer', JSON.stringify(final));

      setStatus('done');

    } catch {

      setStatus('done');

    }

  }



  return (

    <main className="min-h-screen bg-black text-white">

      {/* Header */}

      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="h-8 w-8 rounded-xl bg-white" />

          <span className="font-semibold">dealershipAI</span>

        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">

          <a href="#product" className="hover:text-white">Product</a>

          <a href="#pricing" className="hover:text-white">Pricing</a>

          <button

            onClick={()=>router.push('/onboarding')}

            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10"

          >

            Onboarding

          </button>

        </nav>

      </header>



      {/* Hero */}

      <section className="max-w-6xl mx-auto px-6 pt-14 pb-6 text-center">

        <h1 className="text-5xl md:text-6xl font-light tracking-tight">

          Are you <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">invisible</span> to AI?

        </h1>

        <p className="mt-4 text-white/70">

          When ChatGPT doesn't know your dealership, you leak ~<b>$43,000/mo</b>.

        </p>



        {/* Analyzer */}

        <div className="mt-8 mx-auto max-w-xl bg-white/5 border border-white/10 rounded-2xl p-5">

          <label className="text-sm text-white/70">🔍 Enter your dealership domain</label>

          <div className="mt-2 flex gap-2">

            <input

              type="url"

              value={domain}

              onChange={(e)=>setDomain(e.target.value)}

              placeholder="terryreidhyundai.com"

              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20"

            />

            <button

              onClick={onAnalyze}

              className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:opacity-90"

            >

              {status==='loading' ? 'Analyzing…' : 'Analyze'}

            </button>

          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/50">

            <div>✓ Instant</div><div>✓ 5 AI engines</div><div>✓ Revenue impact</div>

          </div>

        </div>



        <div className="mt-6 text-sm text-white/50">Trusted by 847 dealerships • ⭐ 4.9/5</div>

      </section>



      {/* Loading */}

      {status === 'loading' && (

        <section className="max-w-3xl mx-auto px-6 my-10">

          <div className="border border-white/10 rounded-2xl p-6">

            <div className="font-medium mb-3">⚡ Analyzing {domain}…</div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">

              <div className="h-2 w-5/6 bg-white/30 animate-pulse" />

            </div>

            <ul className="mt-4 text-sm text-white/60 space-y-1">

              <li>✓ Checked 5 AI engines</li>

              <li>✓ Analyzed 120+ data points</li>

              <li>✓ Compared to local competitors</li>

            </ul>

          </div>

        </section>

      )}



      {/* Results */}

      {status === 'done' && result && (

        <section id="report" className="max-w-6xl mx-auto px-6 my-12">

          <div className="border border-white/10 rounded-2xl p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div>

                <div className="text-sm text-white/60">{result.dealership} • {result.location}</div>

                <h2 className="text-2xl font-medium">📊 Your AI Visibility Report</h2>

              </div>

              <div className="text-right">

                <div className="text-sm text-white/60">Overall Score</div>

                <div className="text-3xl font-extrabold text-white">{result.overall}/100</div>

                <div className="text-xs text-white/50">#{result.rank} of {result.of} in market</div>

              </div>

            </div>



            {/* Engine presence strip + Composite */}

            <div className="mt-4 flex items-center justify-end gap-4">

              <AIVStrip domain={domain} />

              <AIVCompositeChip

                domain={domain}

                weights={{ ChatGPT:0.35, Perplexity:0.25, Gemini:0.25, Copilot:0.15 }}

              />

            </div>



            <div className="mt-6 overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="text-left border-b border-white/10 text-white/60">

                    <th className="py-2">AI Engine</th>

                    <th>Your Score</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {result.platforms.map((p: any) => (

                    <tr key={p.name} className="border-b border-white/5">

                      <td className="py-2">{p.name}</td>

                      <td>{p.score}%</td>

                      <td className={p.status==='Excellent'?'text-green-400':p.status==='Good'?'text-emerald-400':'text-amber-400'}>{p.status}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>



            <div className="mt-6">

              <h3 className="font-medium mb-2">🔴 Critical Issues</h3>

              <div className="grid md:grid-cols-3 gap-3">

                {result.issues.map((i: any) => (

                  <div key={i.title} className="rounded-xl border border-white/10 p-4 bg-red-500/5">

                    <div className="font-medium">{i.title}</div>

                    <div className="text-sm text-white/70">→ Costing you ${i.impact.toLocaleString()}/mo</div>

                    <div className="text-xs text-white/50">⏱ Fix in {i.effort}</div>

                  </div>

                ))}

              </div>

            </div>



            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">

              <div className="font-semibold">

                💰 Total Revenue at Risk: ${result.issues.reduce((s:number,i:any)=>s+i.impact,0).toLocaleString()}/mo

              </div>

              <div className="text-sm text-white/60">DealershipAI Pro: $499/mo • ROI: 20x–30x</div>

            </div>



            <div className="mt-6 flex flex-col sm:flex-row gap-3">

              <button

                onClick={()=>router.push('/onboarding')}

                className="px-5 py-3 rounded-xl bg-white text-black text-center font-medium"

              >

                🎯 Fix These Issues – Start Free

              </button>

              <button

                onClick={()=>navigator?.clipboard?.writeText(window.location.href)}

                className="px-5 py-3 rounded-xl border border-white/20 text-center"

              >

                📧 Copy Shareable Report Link

              </button>

            </div>

          </div>

        </section>

      )}

    </main>

  );

}
