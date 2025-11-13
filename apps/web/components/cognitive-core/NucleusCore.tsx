'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { designTokens, getConfidenceColor } from '@/lib/design-tokens';

interface NucleusCoreProps {
  activeMissions?: Array<{
    id: string;
    status: 'active' | 'queued' | 'completed' | 'failed';
    confidence: number;
  }>;
  signals?: Array<{
    source: string;
    strength: number;
    timestamp: number;
  }>;
}

/**
 * NucleusCore - The pulsing central "brain" of the Cognitive Ops Platform
 *
 * Visual Design:
 * - Layered spheres (core, glow, atmosphere)
 * - Pulsing animation based on mission activity
 * - Color shifts based on average confidence
 * - Real-time signal strength affects pulse intensity
 *
 * Performance:
 * - Uses shader materials for efficiency
 * - Minimal geometry (icosahedron for smoothness)
 * - GPU-accelerated animations
 */
export function NucleusCore({ activeMissions = [], signals = [] }: NucleusCoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Calculate average confidence from active missions
  const avgConfidence = activeMissions.length > 0
    ? activeMissions.reduce((sum, m) => sum + m.confidence, 0) / activeMissions.length
    : 0.75;

  // Calculate signal strength
  const signalStrength = signals.length > 0
    ? Math.min(signals.reduce((sum, s) => sum + s.strength, 0) / signals.length, 1)
    : 0.5;

  // Animation loop
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Pulse the core based on activity
    const pulseSpeed = activeMissions.length > 0 ? 2.0 : 1.0;
    const pulseIntensity = 0.05 + (signalStrength * 0.05);
    const pulse = Math.sin(time * pulseSpeed) * pulseIntensity;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + pulse);
    }

    // Rotate glow layer
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.002;
      glowRef.current.rotation.z += 0.001;
      const glowPulse = Math.sin(time * pulseSpeed * 0.5) * 0.1;
      glowRef.current.scale.setScalar(1.2 + glowPulse);
    }

    // Slow counter-rotation for atmosphere
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= 0.001;
      const atmoPulse = Math.sin(time * pulseSpeed * 0.3) * 0.15;
      atmosphereRef.current.scale.setScalar(1.4 + atmoPulse);
    }
  });

  // Determine core color based on confidence
  const confidenceColor = getConfidenceColor(avgConfidence);

  return (
    <group>
      {/* Core Sphere - Solid center */}
      <Sphere ref={coreRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={designTokens.colors.cognitive.nucleusCore}
          emissive={designTokens.colors.cognitive.nucleusCore}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Glow Layer - Energy field */}
      <Sphere ref={glowRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={designTokens.colors.cognitive.nucleusGlow}
          emissive={designTokens.colors.cognitive.nucleusGlow}
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
          metalness={0.5}
          roughness={0.5}
        />
      </Sphere>

      {/* Atmosphere Layer - Outer aura */}
      <Sphere ref={atmosphereRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={designTokens.colors.cognitive.nucleusPulse}
          emissive={confidenceColor}
          emissiveIntensity={0.2}
          transparent
          opacity={0.15}
          metalness={0.3}
          roughness={0.7}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Point light at center */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2 + signalStrength}
        color={designTokens.colors.cognitive.nucleusCore}
        distance={10}
      />
    </group>
  );
}
