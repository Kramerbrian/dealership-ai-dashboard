export function bucket(ts: Date, g: 'day'|'week'|'month'){
  const d = new Date(ts)
  if (g==='day') return d.toISOString().slice(0,10)
  if (g==='week'){
    const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    const day = dt.getUTCDay() || 7
    dt.setUTCDate(dt.getUTCDate() - day + 1)
    return dt.toISOString().slice(0,10)
  }
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`
}

export function wilsonCI(successes: number, trials: number, z=1.96){
  if (trials===0) return { lo: 0, hi: 0 }
  const p = successes/trials
  const denom = 1 + z*z/trials
  const center = p + z*z/(2*trials)
  const margin = z*Math.sqrt((p*(1-p)+z*z/(4*trials))/trials)
  return { lo: (center - margin)/denom, hi: (center + margin)/denom }
}

export function aggregateBy(rows: Array<{asOf: Date; impressions: number; clicks: number; conversions: number; revenue: number}>, g:'day'|'week'|'month', uci=95){
  const z = uci===99?2.576:uci===90?1.645:1.96
  const buckets = new Map<string, {impressions:number; clicks:number; conversions:number; revenue:number}>()
  for (const r of rows){
    const key = bucket(new Date(r.asOf), g)
    const cur = buckets.get(key) || { impressions:0, clicks:0, conversions:0, revenue:0 }
    cur.impressions += r.impressions
    cur.clicks += r.clicks
    cur.conversions += r.conversions
    cur.revenue += r.revenue
    buckets.set(key, cur)
  }
  return Array.from(buckets.entries()).sort((a,b)=>a[0]<b[0]? -1:1).map(([k,v])=>{
    const ctr = v.impressions? v.clicks/v.impressions:0
    const cvr = v.clicks? v.conversions/v.clicks:0
    const ctrCI = wilsonCI(v.clicks, v.impressions, z)
    const cvrCI = wilsonCI(v.conversions, v.clicks, z)
    return { bucket:k, ...v, ctr, cvr, ctr_lo: ctrCI.lo, ctr_hi: ctrCI.hi, cvr_lo: cvrCI.lo, cvr_hi: cvrCI.hi }
  })
}
