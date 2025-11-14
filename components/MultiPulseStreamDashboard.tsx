"use client";

import { useState, useEffect } from "react";
import PulseCardStream from "@/components/PulseCardStream";
import PulseTaskCard from "@/components/PulseTaskCard";
import { usePulseTaskStream } from "@/hooks/usePulseTaskStream";

interface DealerProfile {
  id: string;
  name: string;
  oem: string;
  region: string;
  prompt: string;
}

const DEMO_DEALERS: DealerProfile[] = [
  {
    id: "crm_naples_toyota",
    name: "Germain Toyota of Naples",
    oem: "Toyota",
    region: "SET",
    prompt: "Generate a triage card for a Toyota Camry lease program change in the SET region.",
  },
  {
    id: "crm_fortmyers_honda",
    name: "Germain Honda of Fort Myers",
    oem: "Honda",
    region: "SE",
    prompt: "Generate a triage card for a new Honda APR incentive program and SEO visibility drop.",
  },
  {
    id: "crm_miami_nissan",
    name: "South Miami Nissan",
    oem: "Nissan",
    region: "Florida",
    prompt: "Generate a triage card for Nissan Frontier pricing fluctuation and schema coverage gap.",
  },
];

export default function MultiPulseStreamDashboard() {
  const [activeDealers, setActiveDealers] = useState(DEMO_DEALERS);
  const [selectedDealer, setSelectedDealer] = useState<string | null>(null);

  // Watch queue for the first dealer (or selected dealer)
  const watchDealerId = selectedDealer || activeDealers[0]?.id || "";
  const { tasks, isConnected } = usePulseTaskStream(watchDealerId, "pulse_engine");

  return (
    <div className="p-6 text-gray-100 bg-gray-950 min-h-screen font-mono">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-teal-400">
          Live Pulse Stream Dashboard
        </h1>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-400">
            Queue Watcher: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <p className="mb-6 text-sm text-gray-400">
        Streams real-time triage card generation for multiple dealers using Anthropic Claude models.
        {tasks.length > 0 && (
          <span className="ml-2 text-teal-400">
            {tasks.length} new task{tasks.length !== 1 ? 's' : ''} in queue
          </span>
        )}
      </p>

      {/* Queue Tasks Section */}
      {tasks.length > 0 && (
        <div className="mb-6 p-4 border border-gray-700 rounded bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">New Tasks from Queue</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <PulseTaskCard
                key={task.id}
                taskId={task.id}
                agent={task.agent}
                payload={task.payload}
                dealerId={watchDealerId}
                onComplete={(result) => {
                  console.log('Task completed:', task.id, result);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dealer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeDealers.map((dealer) => (
          <div key={dealer.id} className="p-3 border border-gray-700 rounded bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">{dealer.name}</h2>
            <p className="text-xs text-gray-500 mb-3">
              {dealer.oem} — {dealer.region}
            </p>
            <PulseCardStream prompt={dealer.prompt} />
          </div>
        ))}
      </div>
    </div>
  );
}

