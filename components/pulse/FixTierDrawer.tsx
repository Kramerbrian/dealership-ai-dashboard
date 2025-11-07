// components/pulse/FixTierDrawer.tsx
'use client';

import React, { useState } from 'react';

export default function FixTierDrawer({
  open,
  onClose,
  preview,
  onApply,
  onAutopilot,
  onUndo,
  onSimulate
}: {
  open: boolean;
  onClose: () => void;
  preview: any;
  onApply: () => Promise<{ ok: boolean; receiptId?: string }>;
  onAutopilot: () => Promise<{ ok: boolean }>;
  onUndo: () => Promise<{ ok: boolean }>;
  onSimulate?: () => Promise<any>;
}) {
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  if (!open) return null;

  const handleSimulate = async () => {
    if (!onSimulate) return;
    setSimulating(true);
    try {
      const result = await onSimulate();
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulating(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white text-black rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Fix Preview</h2>
        <p className="mb-4">{preview?.summary || 'No preview available'}</p>
        
        {simulationResult && (
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-2">Simulation Result:</div>
            <div className="text-xs text-blue-700">
              <div>ETA: {simulationResult.etaSeconds}s</div>
              <div>Projected: ${(simulationResult.projectedDeltaUSD / 1000).toFixed(1)}K/mo</div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {onSimulate && (
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
            >
              {simulating ? 'Simulating...' : 'Preview Fix'}
            </button>
          )}
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Apply
          </button>
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
