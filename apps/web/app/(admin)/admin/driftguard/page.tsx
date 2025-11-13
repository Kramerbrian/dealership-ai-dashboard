"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DriftTrendSpark from "@/components/DriftTrendSpark";

type Regr = { type:string; before:number; after:number };

export default function DriftGuardPage(){
  const [data,setData] = useState<{missing:string[]; regressions:Regr[]; ok:boolean}>({missing:[], regressions:[], ok:true});
  const [openEvidence,setOpenEvidence] = useState(false);
  const [origin,setOrigin] = useState("");

  useEffect(()=>{
    fetch("/api/driftguard/run").then(r=>r.json()).then(j=>{
      setData({ missing: j.missing || [], regressions: j.regressions || [], ok: !j.missing?.length && !j.regressions?.length });
    });
  },[]);

  const ack = async () => {
    await fetch("/api/driftguard/ack", { method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ user:"admin", note:"Reviewed drift" }) });
    alert("Acknowledged");
  };

  const promote = async () => {
    const res = await fetch("/api/driftguard/promote", {
      method:"POST",
      headers:{ "content-type":"application/json", "x-role":"admin" },
      body: JSON.stringify({ user:"admin" })
    });
    const j = await res.json();
    if (j.ok) alert("Baseline promoted ✓");
    else alert(`Promote failed: ${j.error||"unknown"}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Schema DriftGuard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>location.reload()}>Refresh</Button>
          <Button onClick={ack}>Acknowledge</Button>
          <Button className="bg-amber-600 hover:bg-amber-700" onClick={promote}>
            Promote latest → baseline
          </Button>
        </div>
      </div>

      {/* Trend card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Drift trend (last 30 runs)</div>
            <div className="text-xs text-slate-400">total missing + regressions</div>
          </div>
          <div className="mt-2"><DriftTrendSpark /></div>
        </CardContent>
      </Card>

      <Card className={data.ok ? "border-green-700" : "border-red-700"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Overall</div>
              <div className={`text-xl font-bold ${data.ok ? "text-green-400":"text-red-400"}`}>
                {data.ok ? "No regressions" : "Drift detected"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-medium mb-2">Missing Types</div>
            {data.missing.length ? (
              <ul className="list-disc list-inside text-red-300">{data.missing.map(m=><li key={m}>{m}</li>)}</ul>
            ) : <div className="text-slate-400 text-sm">—</div>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="font-medium mb-2">Field Regressions</div>
            {data.regressions.length ? (
              <table className="w-full text-sm">
                <thead><tr><th className="text-left">Type</th><th>Before</th><th>After</th></tr></thead>
                <tbody>
                  {data.regressions.map(r=>(
                    <tr key={r.type}><td>{r.type}</td><td>{r.before}</td><td className="text-red-400">{r.after}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="text-slate-400 text-sm">—</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-medium">Evidence</div>
          <div className="flex gap-2">
            <input className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                   placeholder="https://dealer-domain.com"
                   value={origin} onChange={e=>setOrigin(e.target.value)} />
            <Button onClick={()=>setOpenEvidence(true)}>View Evidence</Button>
            <Button variant="outline" onClick={async()=>{
              await fetch("/api/probe/screenshot", {method:"POST",headers:{ "content-type":"application/json" },body:JSON.stringify({ origin })});
              setOpenEvidence(true);
            }}>Capture & View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

