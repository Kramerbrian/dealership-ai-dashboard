'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { NucleusCore } from './NucleusCore';
import { AgentOrbit } from './AgentOrbit';
import { SignalParticles } from './SignalParticles';
import { designTokens } from '@/lib/design-tokens';

interface CognitiveCoreProps {
  /**
   * Active missions currently running
   */
  activeMissions?: Array<{
    id: string;
    agentId: string;
    status: 'active' | 'queued' | 'completed' | 'failed';
    confidence: number;
  }>;

  /**
   * Available agents in the marketplace
   */
  agents?: Array<{
    id: string;
    name: string;
    category: string;
    position: [number, number, number];
  }>;

  /**
   * Real-time signal data
   */
  signals?: Array<{
    source: string;
    strength: number;
    timestamp: number;
  }>;

  /**
   * Interaction callbacks
   */
  onAgentClick?: (agentId: string) => void;
  onMissionClick?: (missionId: string) => void;
}

/**
 * Cognitive Core - The living 3D visualization at the heart of the platform
 *
 * Architecture:
 * - Central nucleus (pulsing purple core)
 * - Agent orbits (marketplace agents in orbital paths)
 * - Signal particles (real-time data flow visualization)
 * - Mission indicators (active task status)
 *
 * Performance:
 * - Uses React Three Fiber for declarative 3D
 * - WebGL with hardware acceleration
 * - Optimized particle systems
 * - Lazy loaded with Suspense
 */
export function CognitiveCore({
  activeMissions = [],
  agents = [],
  signals = [],
  onAgentClick,
  onMissionClick,
}: CognitiveCoreProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#1e293b]">
      {/* 3D Canvas */}
      <Canvas
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Camera Setup */}
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 8]}
            fov={45}
          />

          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight
            position={[0, 0, 0]}
            intensity={1.5}
            color={designTokens.colors.cognitive.nucleusCore}
          />
          <pointLight
            position={[5, 5, 5]}
            intensity={0.3}
            color={designTokens.colors.cognitive.secondary}
          />

          {/* Central Nucleus - The "brain" */}
          <NucleusCore
            activeMissions={activeMissions}
            signals={signals}
          />

          {/* Agent Orbits - Marketplace agents */}
          {agents.map((agent) => (
            <AgentOrbit
              key={agent.id}
              agent={agent}
              onClick={() => onAgentClick?.(agent.id)}
            />
          ))}

          {/* Signal Particles - Data flow */}
          <SignalParticles signals={signals} />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* Overlay UI - Stats and indicators */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
          <div className="text-xs text-white/60 mb-1">COGNITIVE OPS</div>
          <div className="text-lg font-semibold text-white">
            {activeMissions.filter(m => m.status === 'active').length} Active
          </div>
          <div className="text-xs text-white/40 mt-1">
            {agents.length} Agents Available
          </div>
        </div>
      </div>

      {/* Trust Kernel Badge */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-emerald-500/30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Trust Kernel Active</span>
        </div>
      </div>
    </div>
  );
}
