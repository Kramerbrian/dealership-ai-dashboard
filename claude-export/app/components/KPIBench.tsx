'use client'

interface KPIBenchProps {
  val: number
  market: number
  peers: number
}

export function KPIBench({ val, market, peers }: KPIBenchProps) {
  const vsM = Math.round(val - market)
  const vsP = Math.round(val - peers)
  
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
      <div className="rounded border border-slate-800 px-2 py-1">
        vs Market <b className={vsM >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {vsM >= 0 ? '+' : ''}{vsM}
        </b>
      </div>
      <div className="rounded border border-slate-800 px-2 py-1">
        vs Peers <b className={vsP >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {vsP >= 0 ? '+' : ''}{vsP}
        </b>
      </div>
    </div>
  )
}
