'use client'

import { useEffect, useState } from 'react'

function jsonDiff(a: string, b: string){
  try {
    const A = JSON.parse(a), B = JSON.parse(b)
    const add: string[] = [], del: string[] = [], mod: string[] = []
    const keys = new Set([...Object.keys(A), ...Object.keys(B)])
    keys.forEach(k=>{
      if (!(k in A)) add.push(k)
      else if (!(k in B)) del.push(k)
      else if (JSON.stringify(A[k])!==JSON.stringify(B[k])) mod.push(k)
    })
    return { add, del, mod }
  } catch { return { add:[], del:[], mod:[] } }
}

export default function FixActionDrawer({
  open, origin, onClose, onApplied
}: { open:boolean; origin:string; onClose:()=>void; onApplied:()=>Promise<void> }) {
  const [mode, setMode] = useState<'autodealer'|'faq'|'vehicle'>('autodealer')
  const [snippet, setSnippet] = useState('{"@context":"https://schema.org","@type":"AutoDealer","name":"Demo","url":""}')
  const [dryRun, setDryRun] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [baseline, setBaseline] = useState<string>('{}')
  const [autoVerify, setAutoVerify] = useState(true)
  const [diff, setDiff] = useState<{add:string[];del:string[];mod:string[]}>({add:[],del:[],mod:[]})

  useEffect(()=>{
    if (!open) return

    // fetch last version for baseline comparison
    fetch(`/api/site-inject/versions?origin=${encodeURIComponent(origin)}`).then(r=>r.json()).then(j=>{
      const last = (j?.versions?.[0]?.jsonld_snippet) || '{}'
      setBaseline(last)
      setDiff(jsonDiff(last, snippet))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, origin])

  useEffect(()=> setDiff(jsonDiff(baseline, snippet)), [baseline, snippet])

  if (!open) return null

  const submit = async ()=>{
    setSaving(true)
    try {
      const head_html = `<script type='application/ld+json'>${snippet}</script>`
      const res = await fetch('/api/site-inject', {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ hosts:[origin], head_html, footer_html: null, dry_run: dryRun })
      })
      const data = await res.json()
      setResult(data)

      // auto-verify toggle
      if (!dryRun && autoVerify) {
        await fetch('/api/probe/verify', {
          method:'POST',
          headers:{ 'content-type':'application/json' },
          body: JSON.stringify({ origin, verify:true })
        })
      }

      if (!dryRun) await onApplied()
    } finally { setSaving(false) }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50'>
      <div className='absolute right-0 top-0 h-full w-[600px] bg-neutral-900 border-l border-white/10 p-5 overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <div className='text-lg font-semibold text-white'>Fix now — {origin}</div>
          <button onClick={onClose} className='px-3 py-1 rounded-md border border-white/15 text-white hover:bg-white/10'>Close</button>
        </div>

        <div className='space-y-3'>
          <div className='text-sm text-neutral-300'>Snippet type</div>
          <div className='flex gap-2'>
            {(['autodealer','faq','vehicle'] as const).map(k=>(
              <button key={k} onClick={()=> setMode(k)}
                className={`px-3 py-1 rounded ${mode===k?'bg-blue-600 text-white':'bg-neutral-800 border border-white/10 text-white'}`}>
                {k.toUpperCase()}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-3'>
            <label className='flex items-center gap-2 text-sm text-neutral-300'>
              <input type='checkbox' checked={dryRun} onChange={e=> setDryRun(e.target.checked)} />
              Dry-run (diff only)
            </label>
            <label className='flex items-center gap-2 text-sm text-neutral-300'>
              <input type='checkbox' checked={autoVerify} onChange={e=> setAutoVerify(e.target.checked)} disabled={dryRun}/>
              Auto-verify after apply
            </label>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <div className='text-xs text-neutral-400 mb-1'>Baseline JSON-LD (latest)</div>
              <pre className='h-48 overflow-auto bg-neutral-800 p-2 rounded border border-white/10 text-xs text-white'>{baseline}</pre>
            </div>
            <div>
              <div className='text-xs text-neutral-400 mb-1'>Proposed JSON-LD</div>
              <textarea className='w-full h-48 bg-neutral-800 border border-white/10 rounded p-2 font-mono text-xs text-white'
                value={snippet} onChange={e=> setSnippet(e.target.value)} />
            </div>
          </div>

          <div className='text-xs text-neutral-300'>
            <div className='mb-1'>Diff preview:</div>
            <div className='flex flex-wrap gap-2'>
              <span className='px-2 py-1 rounded bg-emerald-700/40 border border-emerald-500/40'>+ {diff.add.length} add</span>
              <span className='px-2 py-1 rounded bg-rose-700/30 border border-rose-500/40'>− {diff.del.length} del</span>
              <span className='px-2 py-1 rounded bg-amber-700/30 border border-amber-500/40'>± {diff.mod.length} mod</span>
            </div>
          </div>

          <button 
            className='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed' 
            disabled={saving} 
            onClick={submit}
          >
            {saving ? (dryRun?'Checking…':'Applying…') : (dryRun?'Check diff':'Apply fix')}
          </button>

          {result && (
            <div className='mt-4 p-3 rounded-lg bg-neutral-800 border border-white/10'>
              <div className='text-sm font-medium mb-1 text-white'>Result</div>
              <pre className='text-xs whitespace-pre-wrap text-neutral-300'>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <RollbackPanel origin={origin} />
        </div>
      </div>
    </div>
  )
}

function RollbackPanel({ origin }:{ origin:string }){
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const refresh = async ()=>{
    const j = await fetch(`/api/site-inject/versions?origin=${encodeURIComponent(origin)}`).then(r=>r.json())
    setVersions(j?.versions || [])
  }
  
  useEffect(()=>{ refresh() }, [origin])
  
  const rollback = async (version_id:string)=>{
    setLoading(true)
    try {
      await fetch('/api/site-inject/rollback', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ version_id, origin }) })
      await refresh()
    } finally { setLoading(false) }
  }

  return (
    <div className='mt-6'>
      <div className='text-sm font-semibold mb-2 text-white'>Rollback</div>
      <div className='space-y-2'>
        {versions.length===0 && <div className='text-neutral-400 text-sm'>No versions yet.</div>}
        {versions.map(v=>(
          <div key={v.version_id} className='flex items-center justify-between border border-white/10 rounded p-2'>
            <div className='text-xs text-neutral-300'>
              <div>#{v.version_id}</div>
              <div>{new Date(v.created_at).toLocaleString()}</div>
              <div className='opacity-70'>{v.summary || '—'}</div>
            </div>
            <button 
              className='px-3 py-1 rounded-md border border-white/15 hover:bg-white/10 disabled:opacity-40 text-white'
              disabled={loading} 
              onClick={()=> rollback(v.version_id)}
            >
              Rollback
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

