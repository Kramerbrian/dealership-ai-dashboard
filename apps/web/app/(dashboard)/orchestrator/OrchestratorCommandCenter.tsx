"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ScenarioSimulatorPanel from "@/components/ScenarioSimulatorPanel";
import MacroPulsePanel from "@/components/pulse/MacroPulsePanel";
import OrchestratorStatusPanel from "@/components/command-center/OrchestratorStatusPanel";
import MysteryShopPanel from "@/components/command-center/MysteryShopPanel";
import dAIChat from "@/components/command-center/dAIChat";
import { Activity, LineChart, ShieldCheck, FlaskConical, Brain, MessageSquare, ShoppingBag } from "lucide-react";

export default function OrchestratorCommandCenter() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"status"|"ai"|"asr"|"plugin"|"scenario"|"mystery-shop"|"dai">("status");

  // Get dealerId from user metadata or fallback
  const dealerId = user?.publicMetadata?.dealerId as string || 
                   user?.publicMetadata?.dealer as string || 
                   user?.id || 
                   "demo-dealer-123";

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { key: "status", label: "System Status", icon: <Brain className="w-4 h-4"/> },
    { key: "dai", label: "AI Assistant Chat", icon: <MessageSquare className="w-4 h-4"/> },
    { key: "ai", label: "AI Health Check", icon: <Activity className="w-4 h-4"/> },
    { key: "asr", label: "Safety Reports", icon: <ShieldCheck className="w-4 h-4"/> },
    { key: "plugin", label: "Tool Status", icon: <LineChart className="w-4 h-4"/> },
    { key: "scenario", label: "What-If Simulator", icon: <FlaskConical className="w-4 h-4"/> },
    { key: "mystery-shop", label: "Competitor Check", icon: <ShoppingBag className="w-4 h-4"/> }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Command Center</h1>
        <p className="text-slate-400">
          Your AI assistant watches your dealership's online presence, finds problems, and suggests ways to improve.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={()=>setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
              activeTab===t.key
                ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 text-white shadow-lg"
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "status" && (
          <>
            <OrchestratorStatusPanel dealerId={dealerId} />
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">How This System Works</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                  <p><strong className="text-white">No Guessing:</strong> Every number comes from real data we can show you</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                  <p><strong className="text-white">Smart but Simple:</strong> We do complex work behind the scenes, but show you easy-to-understand results</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
                  <p><strong className="text-white">Always Learning:</strong> The system gets smarter over time as it learns more about your dealership</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5" />
                  <p><strong className="text-white">Trusted Results:</strong> All recommendations are backed by proof you can verify</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === "dai" && (
          <div className="lg:col-span-2">
            <dAIChat dealerId={dealerId} className="h-[600px]" />
          </div>
        )}

        {activeTab === "scenario" && <ScenarioSimulatorPanel />}
        {activeTab === "ai" && <div className="text-slate-300">AI Health – hook in your widget here.</div>}
        {activeTab === "plugin" && <div className="text-slate-300">Plugin Health – hook in your widget here.</div>}
        {activeTab === "asr" && <MacroPulsePanel />}
        {activeTab === "mystery-shop" && <MysteryShopPanel dealerId={dealerId} />}
      </div>
    </div>
  );
}
