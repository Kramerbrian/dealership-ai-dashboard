'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'
import EvidenceCard from './EvidenceCard'
import VerifyToggle from './VerifyToggle'
import FixActionDrawer from '@/components/FixActionDrawer'

const fetcher = (url: string) => fetch(url, { headers: { 'x-role': 'admin', 'x-tenant': 'demo-dealer-001' } }).then(r=>r.json())

export default function FleetTable(){
  const { data, isLoading, error, mutate } = useSWR('/api/origins', fetcher)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [fixFor, setFixFor] = useState<{origin:string}|null>(null)

  if (isLoading) return <div className='text-sm text-neutral-300'>Loading…</div>
  if (error) return <div className='text-red-400'>Failed to load</div>

  const rows = (data?.data || []) as any[]

  const filtered = rows.filter((r)=> r.origin.toLowerCase().includes(filter.toLowerCase()))

  const allChecked = useMemo(()=> filtered.length>0 && filtered.every(r=> selected[r.origin]), [filtered, selected])
  const anyChecked = useMemo(()=> filtered.some(r=> selected[r.origin]), [filtered, selected])
  const selectedOrigins = useMemo(()=> filtered.filter(r=> selected[r.origin]).map(r=> r.origin), [filtered, selected])

  const toggleAll = () => {
    const next = {...selected}
    const target = !allChecked
    for (const r of filtered){ next[r.origin] = target }
    setSelected(next)
  }

  const bulkVerify = async () => {
    await fetch('/api/probe/verify-bulk', {
      method:'POST',
      headers:{ 'content-type':'application/json','x-role':'admin','x-tenant':'demo-dealer-001' },
      body: JSON.stringify({ origins: selectedOrigins })
    })
    await mutate()
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <input
          placeholder='Filter by domain…'
          value={filter}
          onChange={e=> setFilter(e.target.value)}
          className='px-3 py-2 rounded-md bg-neutral-800 text-white border border-white/10 w-80'
        />
        <button className='btn' onClick={()=>mutate()}>Refresh</button>
        <div className='ml-auto flex gap-3'>
          <button className='btn disabled:opacity-40' disabled={!anyChecked} onClick={bulkVerify}>Verify Selected</button>
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl border border-white/10'>
        <table className='w-full text-sm'>
          <thead className='bg-neutral-800'>
            <tr>
              <th className='p-3'><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label='Select all'/></th>
              <th className='text-left p-3'>Origin</th>
              <th className='text-left p-3'>Tenant</th>
              <th className='text-left p-3'>Evidence</th>
              <th className='text-left p-3'>Verify</th>
              <th className='text-left p-3'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const ev = row.evidence || {}
              const last = ev.lastProbeTs || ev.last_probe_ts
              return (
                <tr key={row.id} className='border-t border-white/10'>
                  <td className='p-3'>
                    <input type="checkbox" checked={!!selected[row.origin]} onChange={()=>{
                      setSelected(s=> ({...s, [row.origin]: !s[row.origin]}))
                    }} aria-label={`Select ${row.origin}`}/>
                  </td>
                  <td className='p-3'><a className='text-primary-400 hover:underline' href={row.origin} target='_blank' rel='noreferrer'>{row.origin}</a></td>
                  <td className='p-3'>{row.tenant}</td>
                  <td className='p-3'>
                    <div className='flex gap-2 flex-wrap'>
                      <EvidenceCard label='Schema' value={ev.schemaCount ?? 0} />
                      <EvidenceCard label='CWV' value={ev.cwvScore ?? '—'} />
                      <EvidenceCard label='Robots' value={ev.robotsOk ? 'OK' : 'Block?'} />
                      <EvidenceCard label='Sitemap' value={ev.sitemapOk ? 'OK' : '—'} />
                      <EvidenceCard label='Last AEO' value={last ? new Date(last).toLocaleString() : '—'} />
                    </div>
                  </td>
                  <td className='p-3'>
                    <VerifyToggle origin={row.origin} verified={!!ev.verified} onChange={async (next)=>{
                      await fetch('/api/probe/verify', { method:'POST', headers:{ 'content-type':'application/json','x-role':'admin','x-tenant':'demo-dealer-001' }, body: JSON.stringify({ origin: row.origin, verify: next }) })
                      mutate()
                    }} />
                  </td>
                  <td className='p-3'>
                    <button className='px-3 py-1 rounded-md border border-white/15 hover:bg-white/10' onClick={()=> setFixFor({ origin: row.origin })}>
                      Fix now
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <FixActionDrawer open={!!fixFor} origin={fixFor?.origin || ''} onClose={()=> setFixFor(null)} onApplied={async()=>{
        setFixFor(null); await mutate()
      }} />
    </div>
  )
}
