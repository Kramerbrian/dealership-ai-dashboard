"use client";
import React, { useState } from "react";
import ScenarioSimulatorPanel from "@/components/ScenarioSimulatorPanel";
import MacroPulsePanel from "@/components/pulse/MacroPulsePanel";
import { Activity, LineChart, ShieldCheck, FlaskConical } from "lucide-react";

export default function OrchestratorCommandCenter() {
  const [activeTab, setActiveTab] = useState<"ai"|"asr"|"plugin"|"cohort"|"forecast"|"scenario">("scenario");

  const tabs = [
    { key: "ai", label: "AI Health", icon: <Activity className="w-4 h-4"/> },
    { key: "asr", label: "ASR Intelligence", icon: <ShieldCheck className="w-4 h-4"/> },
    { key: "plugin", label: "Plugin Health", icon: <LineChart className="w-4 h-4"/> },
    { key: "scenario", label: "Scenario Simulator", icon: <FlaskConical className="w-4 h-4"/> }
  ] as const;

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={()=>setActiveTab(t.key as any)}
            className={`px-3 py-2 rounded border flex items-center gap-1 ${activeTab===t.key?"bg-blue-600 border-blue-500":"border-slate-700 hover:bg-slate-800"}`}
          >
            {t.icon} <span className="ml-1">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "scenario" && <ScenarioSimulatorPanel />}
      {activeTab === "ai" && <div className="text-slate-300">AI Health – hook in your widget here.</div>}
      {activeTab === "plugin" && <div className="text-slate-300">Plugin Health – hook in your widget here.</div>}
      {activeTab === "asr" && <MacroPulsePanel />}
    </div>
  );
}
