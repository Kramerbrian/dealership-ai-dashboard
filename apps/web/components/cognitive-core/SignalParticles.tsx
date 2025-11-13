'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { designTokens } from '@/lib/design-tokens';

interface Signal {
  source: string;
  strength: number;
  timestamp: number;
}

interface SignalParticlesProps {
  signals: Signal[];
}

/**
 * SignalParticles - Particle system visualizing real-time data flow
 *
 * Visual Design:
 * - Small particles flowing from outer edge toward nucleus
 * - Color coded by signal strength (green = strong, amber = medium, red = weak)
 * - Speed varies based on signal urgency
 * - Fades as it approaches core (data being "consumed")
 *
 * Performance:
 * - Uses instanced meshes for efficiency
 * - GPU-accelerated particle system
 * - Maximum 200 particles to maintain 60fps
 */
export function SignalParticles({ signals }: SignalParticlesProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = Math.min(signals.length * 10, 200); // Cap at 200 for performance

  // Generate particle data
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      // Random starting position on outer sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 8;

      return {
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        life: Math.random(), // 0-1, resets when reaching core
        speed: 0.5 + Math.random() * 0.5, // Random speed 0.5-1.0
        signalStrength: signals[i % signals.length]?.strength || 0.5,
      };
    });
  }, [particleCount, signals]);

  // Animation loop
  useFrame(() => {
    if (!particlesRef.current) return;

    const dummy = new THREE.Object3D();

    particles.forEach((particle, i) => {
      // Move particle toward center
      const direction = particle.position.clone().normalize().multiplyScalar(-1);
      particle.velocity.lerp(direction.multiplyScalar(particle.speed * 0.1), 0.1);
      particle.position.add(particle.velocity);

      // Update life (distance from core)
      particle.life = particle.position.length() / 8;

      // Reset if reached core
      if (particle.position.length() < 1.2) {
        // Respawn at outer edge
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 8;

        particle.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        particle.life = 1;
      }

      // Update instance matrix
      dummy.position.copy(particle.position);
      dummy.scale.setScalar(0.05 * particle.life); // Shrink as approaching core
      dummy.updateMatrix();
      particlesRef.current!.setMatrixAt(i, dummy.matrix);

      // Color based on signal strength
      const color = new THREE.Color(
        particle.signalStrength > 0.7
          ? designTokens.colors.cognitive.highConfidence
          : particle.signalStrength > 0.4
          ? designTokens.colors.cognitive.mediumConfidence
          : designTokens.colors.cognitive.lowConfidence
      );
      particlesRef.current!.setColorAt(i, color);
    });

    particlesRef.current.instanceMatrix.needsUpdate = true;
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (particleCount === 0) return null;

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        opacity={0.6}
        color={designTokens.colors.cognitive.tertiary}
      />
    </instancedMesh>
  );
}
