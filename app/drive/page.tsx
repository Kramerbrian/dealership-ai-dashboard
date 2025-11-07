'use client';



import React, { useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';

import { rankPulse } from '@/components/pulse/PulseEngine';
import TierGate from '@/components/gates/TierGate';
import UpgradeButton from '@/components/billing/UpgradeButton';
import { usePlan } from '@/hooks/usePlan';



// Lazy client components

const AIVStrip = dynamic(() => import('@/components/visibility/AIVStrip'), { ssr: false });

const AIVCompositeChip = dynamic(() => import('@/components/visibility/AIVCompositeChip'), { ssr: false });

const FixTierDrawer = dynamic(() => import('@/components/pulse/FixTierDrawer'), { ssr: false });

const ImpactLedger = dynamic(() => import('@/components/pulse/ImpactLedger'), { ssr: false });

const ZeroClickHeat = dynamic(() => import('@/components/pulse/ZeroClickHeat'), { ssr: false });



type Pulse = {

  id: string;

  title: string;

  diagnosis: string;

  prescription: string;

  impactMonthlyUSD: number;

  etaSeconds: number;

  confidenceScore: number;

  recencyMinutes: number;

  kind: 'schema'|'faq'|'reviews'|'visibility'|'traffic'|'funnel'|'geo'|'seo';

};



export default function DrivePage() {

  const [feed, setFeed] = useState<Pulse[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [preview, setPreview] = useState<any>(null);

  const [ledger, setLedger] = useState<any[]>([]);

  const { plan } = usePlan();



  // Bootstrap from analyzer → live pulses

  useEffect(() => {

    (async () => {

      const cached = sessionStorage.getItem('dai:analyzer');

      const analyzer = cached ? JSON.parse(cached) : null;

      const bootstrap: Pulse[] = (analyzer?.issues || []).slice(0, 3).map((i: any) => ({

        id: i.id || crypto.randomUUID(),

        title: i.title || 'Missing Product schema on VDPs',

        diagnosis: i.diagnosis || "AI engines aren't citing your VDPs.",

        prescription: i.prescription || 'Add JSON-LD Product schema to 43 VDPs; revalidate.',

        impactMonthlyUSD: i.impact || 8200,

        etaSeconds: 120,

        confidenceScore: 0.8,

        recencyMinutes: 15,

        kind: 'schema'

      }));



      const live = await fetch('/api/pulse/snapshot', { cache: 'no-store' })

        .then(r => r.json())

        .catch(() => []);



      setFeed([ ...bootstrap, ...live ]);

    })();

  }, []);



  // Role-aware ranking (adjust if you store roles)

  const role: 'gm'|'marketing'|'service' = 'gm';

  const ranked = useMemo(() => rankPulse(feed as any, role), [feed, role]);



  function openFix(p: Pulse) {
    setPreview({
      pulseId: p.id,
      summary: p.title,
      diff: `${p.diagnosis}\n\n${p.prescription}`,
      risk: 'low',
      etaSeconds: p.etaSeconds,
      projectedDeltaUSD: p.impactMonthlyUSD
    });
    setDrawerOpen(true);
  }



  async function onApply() {
    const idempo = crypto.randomUUID();
    const res = await fetch("/api/fix/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempo,
      },
      body: JSON.stringify({
        pulseId: preview.pulseId || preview.summary,
        tier: "apply",
        summary: preview.summary,
        projectedDeltaUSD: preview.projectedDeltaUSD,
        context: { diff: preview.diff },
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "apply failed");

    // Optimistic add to ledger
    setLedger((prev) => [
      {
        id: json.receiptId,
        ts: new Date().toISOString(),
        actor: "human",
        action: preview.summary,
        context: "dashboard",
        deltaUSD: preview.projectedDeltaUSD,
        undoable: true,
      },
      ...prev,
    ]);

    // Store receiptId in preview for undo
    setPreview((p: any) => ({ ...p, receiptId: json.receiptId }));

    // Optionally poll for final delta
    // setTimeout(() => checkStatus(json.receiptId), 60000);

    return { ok: true, receiptId: json.receiptId };
  }

  async function onUndo(receiptId: string) {
    const res = await fetch("/api/fix/undo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "undo failed");
    setLedger((prev) =>
      prev.map((r) =>
        r.id === receiptId ? { ...r, deltaUSD: 0, undone: true } : r
      )
    );
    return { ok: true };
  }

  async function onSimulate() {
    const res = await fetch("/api/fix/apply?simulate=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pulseId: preview.pulseId || preview.summary,
        tier: "apply",
        summary: `Simulate ${preview.summary}`,
        projectedDeltaUSD: preview.projectedDeltaUSD,
        context: { diff: preview.diff },
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "simulate failed");
    // Show json.plan.diff / ETA in the drawer
    console.log("Simulation", json.plan);
    return json.plan;
  }



  return (

    <main className="min-h-screen bg-black text-white">

      {/* Header */}

      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="h-7 w-7 rounded-full bg-white" />

          <span className="text-white/80">DealershipAI • Drive</span>

        </div>

        <div className="flex items-center gap-6">

          <AIVStrip />

          <AIVCompositeChip weights={{ ChatGPT:0.35, Perplexity:0.25, Gemini:0.25, Copilot:0.15 }} />

          <TierGate plan={plan} min="pro">
            <button className="px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
              Autopilot
            </button>
          </TierGate>

          {plan === "free" && <UpgradeButton plan="pro" currentPlan={plan} />}

        </div>

      </header>



      {/* Body */}

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8">

        {/* Pulse Queue */}

        <div className="space-y-4">

          {ranked.slice(0,3).map(p => (

            <article key={p.id} className="rounded-lg border border-white/10 p-5 bg-white/5">

              <div className="text-lg font-medium">{p.title}</div>

              <div className="text-sm text-white/60 mt-1">{p.diagnosis}</div>

              <div className="text-sm text-white mt-2">{p.prescription}</div>



              <div className="mt-3 flex items-center justify-between">

                <div className="text-sm text-white/70">

                  Impact: ${(p.impactMonthlyUSD/1000).toFixed(1)}K/mo • ~{Math.round(p.etaSeconds/60)} min

                </div>

                <div className="flex gap-2">

                  <button onClick={()=>openFix(p)} className="px-4 py-2 rounded-full bg-white text-black font-medium">Fix</button>

                  <TierGate plan={plan} min="pro">
                    <button className="px-4 py-2 rounded-full border border-white/20">Explain</button>
                  </TierGate>

                  <TierGate plan={plan} min="pro">
                    <button className="px-4 py-2 rounded-full border border-white/20">Compare</button>
                  </TierGate>

                </div>

              </div>

            </article>

          ))}



          {/* Optional: Zero-Click Heat (secondary insight) */}

          <ZeroClickHeat

            cells={[

              { pillar:'Sales', device:'Mobile', exposurePct:72, verified:true },

              { pillar:'Sales', device:'Desktop', exposurePct:64, verified:false },

              { pillar:'Service', device:'Mobile', exposurePct:48, verified:false },

              { pillar:'Service', device:'Desktop', exposurePct:52, verified:true },

              { pillar:'Parts', device:'Mobile', exposurePct:31, verified:false },

              { pillar:'Parts', device:'Desktop', exposurePct:36, verified:false }

            ]}

            onCellClick={(c)=>console.log('AIO cell clicked', c)}

          />

        </div>



        {/* Right rail: Fix Drawer + Ledger */}

        {drawerOpen && (

          <FixTierDrawer

            open={drawerOpen}

            onClose={()=>setDrawerOpen(false)}

            preview={preview}

            onApply={onApply}

            onAutopilot={async()=>{
              if (plan !== "pro" && plan !== "enterprise") {
                alert("Autopilot requires Pro or Enterprise plan");
                return {ok:false, error: "Plan required"};
              }
              return {ok:true};
            }}

            onUndo={async()=>{
              if (!preview?.receiptId) return {ok:false, error: "No receipt ID"};
              return await onUndo(preview.receiptId);
            }}

            onSimulate={onSimulate}

          />

        )}

        <aside className="hidden lg:block">

          <ImpactLedger receipts={ledger} onExport={(fmt)=>console.log('export', fmt)} />

        </aside>

      </section>

    </main>

  );

}

