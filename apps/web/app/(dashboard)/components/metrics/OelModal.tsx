"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useOEL } from "@/app/(dashboard)/hooks/useOEL";
import { getApiBase } from "@/lib/apiConfig";
import { motion } from "framer-motion";
import { X, SlidersHorizontal, DollarSign } from "lucide-react";

export default function OelModal({
  domain,
  open,
  onClose
}:{ domain: string; open: boolean; onClose: () => void }) {
  const { data, loading } = useOEL(domain);
  const [adSpend, setAdSpend] = useState(12000);
  const [adWastePct, setAdWastePct] = useState(0.45);
  const [visitors, setVisitors] = useState(2500);
  const [visibilityLossPct, setVisibilityLossPct] = useState(0.25);
  const [leadConvPct, setLeadConvPct] = useState(0.05);
  const [leadValue, setLeadValue] = useState(450);
  const [recovered, setRecovered] = useState(3800);

  const [calc, setCalc] = useState<any>(null);
  const [recalcLoading, setRecalcLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    const { inputs } = data;
    setAdSpend(inputs.adSpend);
    setAdWastePct(inputs.adWastePct);
    setVisitors(inputs.visitors);
    setVisibilityLossPct(inputs.visibilityLossPct);
    setLeadConvPct(inputs.leadConvRatePct);
    setLeadValue(inputs.avgLeadValue);
    setRecovered(inputs.recovered);
    setCalc(data);
  }, [data]);

  async function recompute() {
    setRecalcLoading(true);
    const base = getApiBase();
    const query = new URLSearchParams({
      domain,
      adSpend: String(adSpend),
      adWastePct: String(adWastePct),
      visitors: String(visitors),
      visibilityLossPct: String(visibilityLossPct),
      leadValue: String(leadValue),
      leadConvPct: String(leadConvPct),
      recovered: String(recovered),
      months: "6"
    }).toString();
    try {
      const res = await fetch(`${base}/metrics/oel?${query}`);
      const json = await res.json();
      setCalc(json);
    } finally {
      setRecalcLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[96]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-0 top-0 h-full w-[520px] bg-neutral-900 text-white border-l border-neutral-800 p-5 overflow-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Opportunity Efficiency Loss (OEL)</div>
          <button className="text-neutral-400 hover:text-white" onClick={onClose}><X/></button>
        </div>

        {loading ? <div>Loading…</div> : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <Stat label="Wasted Ad Spend" value={`$${(calc?.wastedSpend||0).toLocaleString()}`} accent="red"/>
              <Stat label="Lost Qualified Lead Value" value={`$${(calc?.lostLeadsValue||0).toLocaleString()}`} accent="amber"/>
              <Stat label="Recovered" value={`$${(calc?.recovered||0).toLocaleString()}`} accent="emerald"/>
              <Stat label="Net OEL" value={`$${(calc?.oel||0).toLocaleString()}`} accent={(calc?.oel ?? 0) > 0 ? "red" : "emerald"}/>
            </div>

            <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal size={16}/><div className="text-sm font-medium">Scenario Controls</div>
              </div>
              <Range label={`Ad Spend $${adSpend.toLocaleString()}`} value={adSpend} min={0} max={50000} step={500} onChange={setAdSpend}/>
              <Range label={`Ad Waste ${Math.round(adWastePct*100)}%`} value={Math.round(adWastePct*100)} min={0} max={100} step={1} onChange={v=>setAdWastePct(v/100)}/>
              <Range label={`Monthly Visitors ${visitors}`} value={visitors} min={0} max={100000} step={100} onChange={setVisitors}/>
              <Range label={`Visibility Loss ${Math.round(visibilityLossPct*100)}%`} value={Math.round(visibilityLossPct*100)} min={0} max={100} step={1} onChange={v=>setVisibilityLossPct(v/100)}/>
              <Range label={`Lead Conv Rate ${Math.round(leadConvPct*100)}%`} value={Math.round(leadConvPct*100)} min={0} max={30} step={1} onChange={v=>setLeadConvPct(v/100)}/>
              <Range label={`Avg Lead Value $${leadValue}`} value={leadValue} min={50} max={5000} step={50} onChange={setLeadValue}/>
              <Range label={`Recovered $${recovered}`} value={recovered} min={0} max={50000} step={500} onChange={setRecovered}/>

              <div className="mt-3">
                <button
                  onClick={recompute}
                  disabled={recalcLoading}
                  className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-sm"
                >
                  {recalcLoading ? "Recalculating…" : "Recalculate"}
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm font-medium mb-2">Efficiency Score</div>
              <div className="text-3xl font-light">{calc?.score ?? "—"} / 100</div>
              <div className="text-xs text-neutral-400 mt-1">
                Higher is better. Score is normalized vs baseline to show how efficiently your spend + visibility convert to qualified outcomes.
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={()=>{
                  const e = new CustomEvent("open-fix-pack");
                  window.dispatchEvent(e);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
              >
                <DollarSign size={16}/> Review & Deploy Fix Pack
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Stat({label, value, accent}:{label:string; value:string; accent:"red"|"amber"|"emerald"}) {
  const tone = {
    red: "bg-red-900/20 border-red-500/40 text-red-300",
    amber: "bg-amber-900/20 border-amber-500/40 text-amber-200",
    emerald: "bg-emerald-900/20 border-emerald-500/40 text-emerald-200"
  }[accent];
  return (
    <div className={`p-3 rounded-lg border ${tone}`}>
      <div className="text-xs text-white/70">{label}</div>
      <div className="text-xl font-medium">{value}</div>
    </div>
  );
}

function Range({label,value,min,max,step,onChange}:{label:string; value:number; min:number; max:number; step:number; onChange:(v:number)=>void}) {
  return (
    <div className="mb-3">
      <div className="text-xs text-white/70 mb-1">{label}</div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

