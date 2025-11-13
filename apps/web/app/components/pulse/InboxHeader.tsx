import React from 'react';
import { useHudStore } from '@/lib/store/hud';

export function InboxHeader() {
  const filter = useHudStore((s) => s.setFilter);

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Pulse Inbox</h2>
      <div className="flex gap-2">
        <button
          onClick={() => filter('all')}
          className="px-3 py-1 rounded border hover:bg-gray-50"
        >
          All
        </button>
        <button
          onClick={() => filter('critical')}
          className="px-3 py-1 rounded border hover:bg-gray-50"
        >
          Critical
        </button>
        <button
          onClick={() => filter('kpi')}
          className="px-3 py-1 rounded border hover:bg-gray-50"
        >
          KPI
        </button>
        <button
          onClick={() => filter('incident')}
          className="px-3 py-1 rounded border hover:bg-gray-50"
        >
          Incidents
        </button>
      </div>
    </div>
  );
}
