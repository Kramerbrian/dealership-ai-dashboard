'use client'

import { useMemo, useState } from 'react'

interface PreviewRow {
  origin: string
  tenant: string
  checksum?: string
}

interface InvalidRow {
  line: number
  reason: string
}

export default function BulkCsvEditor({ preview, invalid, onCommit }:{
  preview: PreviewRow[];
  invalid: InvalidRow[];
  onCommit: (rows: Array<{ origin:string; tenant:string; checksum?:string }>)=>Promise<void>;
}){
  const [edits, setEdits] = useState<Array<{ origin:string; tenant:string }>>([])
  
  const setRow = (idx:number, field:'origin'|'tenant', val:string)=>{
    setEdits(prev=>{
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }
  
  const rows = useMemo(()=> edits.length?edits:preview.slice(0,50), [edits, preview])

  const commit = async ()=>{
    const cleaned = rows.filter(r=> r.origin?.length>0).map(r=> ({ origin: r.origin, tenant: r.tenant || 'default-tenant' }))
    await onCommit(cleaned)
  }

  return (
    <div className='space-y-3'>
      <div className='text-sm font-medium text-white'>Fix invalid rows</div>
      {invalid.length>0 && <div className='text-xs text-amber-300'>{invalid.length} invalid lines flagged</div>}
      <div className='rounded border border-white/10 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-neutral-800'>
            <tr><th className='p-2 text-left text-white'>Origin</th><th className='p-2 text-left text-white'>Tenant</th></tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className='border-t border-white/10'>
                <td className='p-2'>
                  <input 
                    className='w-full bg-neutral-800 border border-white/10 rounded px-2 py-1 text-white'
                    defaultValue={r.origin} 
                    onChange={e=> setRow(i,'origin', e.target.value)} 
                  />
                </td>
                <td className='p-2'>
                  <input 
                    className='w-full bg-neutral-800 border border-white/10 rounded px-2 py-1 text-white'
                    defaultValue={r.tenant} 
                    onChange={e=> setRow(i,'tenant', e.target.value)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        className='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white'
        onClick={commit}
      >
        Commit fixed rows
      </button>
    </div>
  )
}

