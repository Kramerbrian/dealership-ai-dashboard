"use client";
import { useState } from "react";

interface MacroPulsePanelProps {
  events?: any[];
  radar?: {
    alerts: any[];
    summary: {
      affectedDealers: number;
      affectedModels: number;
    };
  };
  impacts?: any[];
  onSimulate?: (params: any) => Promise<any>;
  onApplyAction?: (modelId: string) => Promise<void>;
}

export default function MacroPulsePanel({
  events = [],
  radar = { alerts: [], summary: { affectedDealers: 0, affectedModels: 0 } },
  impacts = [],
  onSimulate = async()=>({}),
  onApplyAction = async()=>{}
}: MacroPulsePanelProps) {
  const [dealerId, setDealer] = useState("dea_demo_1");
  const [modelId, setModel] = useState("model3");
  const [msrpDeltaAbs, setDelta] = useState(-5000);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
        <div className="text-lg font-semibold text-slate-200">Macro Market Pulse</div>
        <ul className="mt-2 text-sm text-slate-300">
          {events.map((e:any, i:number)=>(
            <li key={i}>• {(e.oem ?? e.type)}: {e.narrative ?? "—"}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
        <div className="font-medium text-slate-200">Radar</div>
        <div className="text-sm text-slate-400">
          Affected dealers: {radar.summary.affectedDealers} • models: {radar.summary.affectedModels}
        </div>
      </section>

      <section className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
        <div className="font-medium text-slate-200 mb-2">Quick Simulator</div>
        <div className="flex items-center gap-2">
          <input
            className="border p-2 rounded bg-slate-800 text-slate-200"
            value={dealerId}
            onChange={e=>setDealer(e.target.value)}
          />
          <input
            className="border p-2 rounded bg-slate-800 text-slate-200"
            value={modelId}
            onChange={e=>setModel(e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded bg-slate-800 text-slate-200 w-36"
            value={msrpDeltaAbs}
            onChange={e=>setDelta(+e.target.value)}
          />
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={async()=>{ await onSimulate({ dealerId, modelId, msrpDeltaAbs }); }}
          >
            Simulate
          </button>
        </div>
      </section>

      <section className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60">
        <div className="font-medium text-slate-200 mb-2">Impacts</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="text-left">Dealer</th>
              <th>Model</th>
              <th>Adj</th>
              <th>Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {impacts.map((im:any, i:number)=> (
              <tr key={i} className="border-t border-slate-800 text-slate-300">
                <td>{im.dealerId}</td>
                <td>{im.modelId}</td>
                <td>{im.appraisalAdj}</td>
                <td>{im.priceAction?.actionLabel}</td>
                <td>
                  <button
                    className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-800"
                    onClick={()=>onApplyAction(im.modelId)}
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
