'use client';

import React from 'react';
import { useBrandTint } from '@/lib/hooks/useBrandTint';
import MotionOrchestrator from '@/app/components/MotionOrchestrator';
// import DailyPulse from '@/app/components/DailyPulse'; // TODO: Re-enable when component is available

export default function OrchestratorPreviewPage() {
  const brandTint = useBrandTint();

  return (
    <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${brandTint}05 0%, #000 100%)` }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: brandTint }}>
          Orchestrator 3.0 Preview
        </h1>

        <MotionOrchestrator
          brandTint={brandTint}
          metrics={{
            vai: 87.3,
            piqr: 92.1,
            qai: 78.9,
            hrp: 0.12,
          }}
        >
          <div className="space-y-6">
            {/* <DailyPulse tenantId="demo" /> */}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: brandTint }}>
                  Market Pulse
                </h3>
                <p className="text-gray-400 text-sm">
                  Real-time AI visibility tracking across all platforms
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: brandTint }}>
                  Revenue Protection
                </h3>
                <p className="text-gray-400 text-sm">
                  Monitor and protect revenue at risk from AI visibility gaps
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: brandTint }}>
                  Competitor Analysis
                </h3>
                <p className="text-gray-400 text-sm">
                  Track competitor movements and market positioning
                </p>
              </div>
            </div>
          </div>
        </MotionOrchestrator>
      </div>
    </div>
  );
}

