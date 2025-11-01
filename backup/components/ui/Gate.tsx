'use client';

export function Gate({ 
  plan, 
  need, 
  children 
}: { 
  plan: 'Awareness' | 'DIY' | 'DFY'; 
  need: 'DIY' | 'DFY'; 
  children: React.ReactNode 
}) {
  const ok = (plan === 'DFY') || (plan === 'DIY' && need === 'DIY');
  
  if (ok) return <>{children}</>;
  
  return (
    <div className="rounded-xl border border-slate-800/70 p-3 text-sm bg-slate-900/50">
      <div className="mb-2 text-slate-300">Upgrade required</div>
      <button 
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 transition-colors"
        onClick={() => window.open('/pricing', '_blank')}
      >
        See plans
      </button>
    </div>
  );
}
