'use client';

export default function VerifyToggle({ origin, verified, onChange }:{
  origin:string; verified:boolean; onChange:(v:boolean)=>void
}){
  return (
    <label className='flex items-center gap-2 text-xs'>
      <input type='checkbox' checked={verified} onChange={e=> onChange(e.target.checked)} />
      <span className={`px-2 py-0.5 rounded ${verified?'bg-emerald-700/40 text-emerald-200':'bg-neutral-700/40 text-neutral-200'}`}>
        {verified ? 'Verified (Perplexity + Rich Results)' : 'Not verified'}
      </span>
    </label>
  )
}
