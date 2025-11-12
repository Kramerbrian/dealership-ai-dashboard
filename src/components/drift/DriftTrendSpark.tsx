"use client";

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function DriftTrendSpark(){
  const [data, setData] = useState<{ ts:string; total:number }[]>([]);
  
  useEffect(()=>{
    fetch('/api/driftguard/history').then(r=>r.json()).then((j)=>{
      const d = (j.items||[]).slice(-30).map((it:any)=>({ 
        ts: new Date(it.ts).toLocaleDateString(), 
        total: it.counts?.total ?? 0 
      }));
      setData(d);
    });
  },[]);

  if (!data.length) return <div className='text-slate-400 text-xs'>No drift history yet.</div>;

  return (
    <div className='h-20 w-full'>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id='colorDrift' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#ef4444' stopOpacity={0.7} />
              <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey='ts' hide/>
          <YAxis hide/>
          <Tooltip/>
          <Area type='monotone' dataKey='total' stroke='#ef4444' fill='url(#colorDrift)'/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

