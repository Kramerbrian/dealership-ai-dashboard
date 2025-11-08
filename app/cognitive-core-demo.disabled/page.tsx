'use client';

import { useState } from 'react';
import { CognitiveCore } from '@/components/cognitive-core';
import { dAINarrator } from '@/components/dai';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Cognitive Core Demo Page
 *
 * Interactive demonstration of the 3D Cognitive Ops Platform visualization
 */
export default function CognitiveCoreDemoPage() {
  // Sample data - In production, this would come from real API/database
  const [activeMissions] = useState([
    {
      id: 'mission-1',
      agentId: 'schema-king',
      status: 'active' as const,
      confidence: 0.92,
    },
    {
      id: 'mission-2',
      agentId: 'mystery-shop',
      status: 'active' as const,
      confidence: 0.87,
    },
    {
      id: 'mission-3',
      agentId: 'review-monitor',
      status: 'queued' as const,
      confidence: 0.75,
    },
  ]);

  const [agents] = useState([
    {
      id: 'schema-king',
      name: 'Schema King',
      category: 'seo',
      position: [3, 0, 0] as [number, number, number],
    },
    {
      id: 'mystery-shop',
      name: 'Mystery Shop',
      category: 'intelligence',
      position: [0, 0, 3] as [number, number, number],
    },
    {
      id: 'review-monitor',
      name: 'Review Monitor',
      category: 'reputation',
      position: [-3, 0, 0] as [number, number, number],
    },
    {
      id: 'blockdrive',
      name: 'Blockdrive',
      category: 'automation',
      position: [0, 0, -3] as [number, number, number],
    },
    {
      id: 'competitor-watch',
      name: 'Competitor Watch',
      category: 'intelligence',
      position: [2, 0, 2] as [number, number, number],
    },
  ]);

  const [signals] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      source: `signal-${i}`,
      strength: Math.random(),
      timestamp: Date.now() - Math.random() * 60000,
    }))
  );

  const handleAgentClick = (agentId: string) => {
    console.log('Agent clicked:', agentId);
    // In production, open agent details panel
  };

  const handleMissionClick = (missionId: string) => {
    console.log('Mission clicked:', missionId);
    // In production, open mission details panel
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#1e293b]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white">Cognitive Core</h1>
              <p className="text-sm text-white/60">3D visualization of the Cognitive Ops Platform</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {activeMissions.filter(m => m.status === 'active').length}
              </div>
              <div className="text-xs text-white/60">Active Missions</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{agents.length}</div>
              <div className="text-xs text-white/60">Agents</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{signals.length}</div>
              <div className="text-xs text-white/60">Signals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Core Canvas */}
      <div className="w-full h-screen">
        <CognitiveCore
          activeMissions={activeMissions}
          agents={agents}
          signals={signals}
          onAgentClick={handleAgentClick}
          onMissionClick={handleMissionClick}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-md rounded-lg px-6 py-4 border border-white/10">
          <div className="text-xs text-white/60 mb-2">CONTROLS</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-white font-medium">Rotate</div>
              <div className="text-white/60 text-xs">Click + Drag</div>
            </div>
            <div>
              <div className="text-white font-medium">Zoom</div>
              <div className="text-white/60 text-xs">Scroll</div>
            </div>
            <div>
              <div className="text-white font-medium">Interact</div>
              <div className="text-white/60 text-xs">Hover + Click Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* dAI Narrator */}
      <dAINarrator
        context={{
          activeMissions: activeMissions.filter(m => m.status === 'active').length,
          recentEvents: [],
          userTenure: 15, // Demo: 15 days (dry-wit personality)
        }}
        onMessageClick={(message) => {
          console.log('dAI message clicked:', message);
        }}
      />
    </div>
  );
}
