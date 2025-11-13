'use client';
import { useEffect, useRef } from 'react';

// Minimal canvas line chart (no deps)
export default function APIUsageChart({points}:{points:{t:string;calls:number}[]}){
  const ref=useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    const W=c.width, H=c.height, pad=24;
    ctx.clearRect(0,0,W,H);
    const max=Math.max(1,...points.map(p=>p.calls));
    const step=(W-2*pad)/Math.max(1,points.length-1);
    // axes
    ctx.beginPath(); ctx.moveTo(pad, H-pad); ctx.lineTo(W-pad,H-pad); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.stroke();
    // line
    ctx.beginPath();
    points.forEach((p,i)=>{
      const x=pad+i*step;
      const y=H-pad-(p.calls/max)*(H-2*pad);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    });
    ctx.stroke();
  },[points]);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-2">API Usage (Hourly)</div>
      <canvas ref={ref} width={480} height={160} className="w-full h-40"/>
    </div>
  );
}