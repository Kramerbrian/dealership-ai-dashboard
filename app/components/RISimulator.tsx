import React, { useMemo, useState } from "react";
import { computeRI } from "@/app/lib/scoring/relevance";

export default function RISimulator(){
  const [visibility, setVis] = useState(0.60);
  const [proximity, setProx] = useState(0.55);
  const [authority, setAuth] = useState(0.80);
  const [scs, setSCS] = useState(88);
  const result = useMemo(()=> computeRI({ visibility, proximity, authority, scsPct: scs }), [visibility, proximity, authority, scs]);
  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">RI Simulator</h3>
        <span className="text-xs text-gray-500">Preview how fixes move your Relevance Index</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Slider label="Visibility" value={visibility} onChange={setVis} />
          <Slider label="Proximity" value={proximity} onChange={setProx} />
          <Slider label="Authority" value={authority} onChange={setAuth} />
          <Slider label="Schema (SCS %)" value={scs/100} onChange={(v)=> setSCS(Math.round(v*100))} format={(v)=> `${Math.round(v*100)}%`} />
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Computed</div>
          <div className="text-3xl font-bold">RI: {result.ri.toFixed(3)}</div>
          <ul className="mt-3 text-sm text-gray-700 space-y-1">
            <li>Visibility: {result.visibility.toFixed(2)}</li>
            <li>Proximity: {result.proximity.toFixed(2)}</li>
            <li>Authority: {result.authority.toFixed(2)}</li>
            <li>Schema Weight: {result.scsWeight.toFixed(2)}</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">Tip: Raise SCS by fixing missing <code>offers.availability</code> to lift RI without changing inventory.</p>
        </div>
      </div>
    </div>
  );
}
function Slider({ label, value, onChange, format }: { label: string; value: number; onChange: (n:number)=>void; format?: (n:number)=>string }){
  const pct = Math.round(value*100);
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="text-sm font-medium">{label}</span><span className="text-sm text-gray-600">{format ? format(value) : `${pct}%`}</span></div>
      <input type="range" min={0} max={100} value={pct} onChange={(e)=> onChange(parseInt(e.target.value)/100)} className="w-full" />
    </div>
  );
}

