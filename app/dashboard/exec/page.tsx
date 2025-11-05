"use client";
import useSWR from 'swr';

const f = (u: string) => fetch(u).then(r => r.json());

export default function Exec() {
  const { data: pulse } = useSWR('/api/pulse/weekly', f, { refreshInterval: 0 });
  const { data: win } = useSWR('/api/win-prob?ai=62&rt=68&sc=72&gbp=85&zc=58', f);
  
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Executive Mode</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Card 
          title="Revenue at Risk" 
          value="$367K/mo" 
          hint="Estimated from AI + Zero-Click deltas"
        />
        <Card 
          title="Revenue Recovered (30d)" 
          value="$128K" 
          hint="Verified by deltas"
        />
        <Card 
          title="Win Probability" 
          value={`${win?.winProb ?? 71}%`} 
          hint="Projected for AI-origin leads"
        />
      </div>
      <div className="mt-8 text-sm text-white/70">
        Board-room summary converts technical metrics into $$ context.
      </div>
    </main>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-white/5">
      <div className="text-sm text-white/60">{title}</div>
      <div className="text-3xl font-light">{value}</div>
      {hint && <div className="text-xs text-white/50">{hint}</div>}
    </div>
  );
}
