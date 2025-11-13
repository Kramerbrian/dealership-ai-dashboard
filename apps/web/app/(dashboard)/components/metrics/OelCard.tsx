"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useOEL } from "@/app/(dashboard)/hooks/useOEL";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign } from "lucide-react";
import { writeEvent } from "@/lib/feed/writeEvent";

export function OelCard({
  domain,
  onOpen
}:{ domain: string; onOpen: () => void }) {
  const { data, loading, err } = useOEL(domain);
  const [tone, setTone] = useState<"good"|"warning"|"alert">("good");

  useEffect(() => {
    if (!data) return;
    // derive tone from score or oel relative to ad spend
    if (data.score >= 80) setTone("good");
    else if (data.score >= 60) setTone("warning");
    else setTone("alert");

    // Decision feed: Log high OEL alerts
    const oel = data.oel || 0;
    if (oel > 15000) {
      writeEvent({
        title: "High Opportunity Efficiency Loss",
        description: `OEL at $${oel.toLocaleString()}/month. Consider reviewing Fix Pack to reduce wasted spend and recover qualified leads.`,
        impact: `$${oel.toLocaleString()}`,
        severity: "alert",
      });
    } else if (oel > 10000) {
      writeEvent({
        title: "Opportunity Efficiency Loss Detected",
        description: `OEL at $${oel.toLocaleString()}/month. Review ad spend efficiency and visibility gaps.`,
        impact: `$${oel.toLocaleString()}`,
        severity: "warning",
      });
    }
  }, [data]);

  const toneClass = {
    good: "text-emerald-300 border-emerald-500/30",
    warning: "text-amber-300 border-amber-500/30",
    alert: "text-red-300 border-red-500/30",
  }[tone];

  return (
    <div className={`p-4 rounded-xl bg-white/5 border ${toneClass}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">Opportunity Efficiency Loss (OEL)</div>
        <button onClick={onOpen} className="text-xs text-white/70 hover:text-white">Details</button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className={toneClass.replace('text-','text-')}/>
          <div className={`text-2xl font-semibold ${toneClass}`}>
            {loading ? "…" : `$${(data?.oel || 0).toLocaleString()}`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Efficiency</div>
          <div className="text-lg text-white">{loading ? "…" : `${data?.score ?? 0}/100`}</div>
        </div>
      </div>
      <div className="mt-3 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data?.series || []}>
            <defs>
              <linearGradient id="oelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="period" hide />
            <YAxis hide domain={['auto','auto']}/>
            <Tooltip contentStyle={{ background: "rgba(10,10,10,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}/>
            <Area dataKey="oel" type="monotone" stroke="#f43f5e" fill="url(#oelGrad)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {err && <div className="text-xs text-red-300 mt-2">{err}</div>}
    </div>
  );
}

