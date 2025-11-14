"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import OrchestratorConsole from "@/pulse/meta/orchestrator-console";

export default function OrchestratorConsolePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (!user) {
    redirect("/sign-in");
  }

  return <OrchestratorConsole user={user} />;
}

