'use client'

import { useRef, useState } from 'react'
import BulkCsvEditor from './BulkCsvEditor'

export default function BulkUploadPanel(){
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<any[]|null>(null)
  const [invalid, setInvalid] = useState<any[]|null>(null)
  const [counts, setCounts] = useState<{parsed:number;valid:number;invalid:number;duplicates:number}|null>(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file: File)=>{
    setBusy(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await fetch('/api/origins/bulk-csv', { method:'POST', body: fd })
      const j = await res.json()
      setPreview(j.preview || [])
      setInvalid(j.invalid || [])
      setCounts(j.counts || null)
    } finally { setBusy(false) }
  }

  const commit = async (rows: any[])=>{
    setBusy(true)
    try {
      const res = await fetch('/api/origins/bulk-csv/commit', {
        method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ rows })
      })
      const j = await res.json()
      alert(`Queued ${j?.results?.length || 0} origins`)
    } finally { setBusy(false) }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <input 
          ref={inputRef} 
          type='file' 
          accept='.csv' 
          onChange={e=> e.target.files?.[0] && upload(e.target.files[0])} 
          className='text-white'
        />
        {busy && <span className='text-xs text-neutral-400'>Working…</span>}
      </div>

      {counts && (
        <div className='text-xs text-neutral-300'>
          Parsed: {counts.parsed} • Valid: {counts.valid} • Invalid: {counts.invalid} • Duplicates: {counts.duplicates}
        </div>
      )}

      {preview && (
        <>
          <div className='text-sm font-medium text-white'>Preview (first 50)</div>
          <div className='rounded border border-white/10 overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-neutral-800'>
                <tr>
                  <th className='p-2 text-left text-white'>Origin</th>
                  <th className='p-2 text-left text-white'>Tenant</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0,50).map((r:any,i:number)=>(
                  <tr key={i} className='border-t border-white/10'>
                    <td className='p-2 text-white'>{r.origin}</td>
                    <td className='p-2 text-white'>{r.tenant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='flex gap-3'>
            <button 
              className='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white'
              onClick={()=> commit(preview!)}
            >
              Commit all
            </button>
            <button 
              className='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white'
              onClick={()=> commit(preview!.slice(0,1000))}
            >
              Commit first 1,000
            </button>
          </div>

          {!!invalid?.length && (
            <div className='mt-6'>
              <BulkCsvEditor preview={preview} invalid={invalid} onCommit={commit}/>
            </div>
          )}
        </>
      )}
    </div>
  )
}

