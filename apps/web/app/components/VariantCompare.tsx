'use client'
import useSWR from 'swr'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())
export default function VariantCompare(){
  const { data } = useSWR('/api/ai-scores', fetcher)
  const k = data?.kpis || { algorithmicTrust: 0, clarity: 0, trustImpact: 1 }
  return (
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div className="p-3 rounded-lg border">ATI {k.algorithmicTrust}</div>
      <div className="p-3 rounded-lg border">Clarity {k.clarity}</div>
      <div className="p-3 rounded-lg border">Trust Impact ×{k.trustImpact}</div>
    </div>
  )
}
