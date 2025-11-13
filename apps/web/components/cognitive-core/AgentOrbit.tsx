'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { designTokens } from '@/lib/design-tokens';

interface Agent {
  id: string;
  name: string;
  category: string;
  position: [number, number, number];
}

interface AgentOrbitProps {
  agent: Agent;
  onClick?: () => void;
}

/**
 * AgentOrbit - Represents a single agent node in orbital path around the core
 *
 * Visual Design:
 * - Small glowing sphere representing the agent
 * - Orbital path around central nucleus
 * - Color-coded by agent category
 * - Hover state with label
 * - Click interaction for agent details
 *
 * Categories:
 * - SEO/Schema: Cyan
 * - Reputation: Green
 * - Intelligence: Purple
 * - Automation: Blue
 */
export function AgentOrbit({ agent, onClick }: AgentOrbitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const orbitSpeed = useRef(Math.random() * 0.3 + 0.2); // Random speed 0.2-0.5
  const orbitRadius = useRef(3 + Math.random() * 2); // Random radius 3-5

  // Category colors
  const categoryColors: Record<string, string> = {
    seo: designTokens.colors.cognitive.tertiary, // Cyan
    reputation: designTokens.colors.cognitive.highConfidence, // Green
    intelligence: designTokens.colors.cognitive.primary, // Purple
    automation: designTokens.colors.cognitive.secondary, // Blue
  };

  const agentColor = categoryColors[agent.category.toLowerCase()] || designTokens.colors.cognitive.primary;

  // Orbital animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const angle = time * orbitSpeed.current;
      const radius = orbitRadius.current;

      // Calculate orbital position
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = Math.sin(angle * 0.5) * 0.5; // Slight vertical movement

      // Scale on hover
      const targetScale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Gentle rotation
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.15, 16, 16]}
        position={agent.position}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={agentColor}
          emissive={agentColor}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Label on hover */}
      {hovered && (
        <Html
          position={[
            meshRef.current?.position.x || 0,
            (meshRef.current?.position.y || 0) + 0.5,
            meshRef.current?.position.z || 0,
          ]}
          center
        >
          <div className="bg-black/90 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 pointer-events-none whitespace-nowrap">
            <div className="text-xs font-semibold text-white">{agent.name}</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wide">{agent.category}</div>
          </div>
        </Html>
      )}

      {/* Orbital trail effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius.current - 0.02, orbitRadius.current + 0.02, 64]} />
        <meshBasicMaterial
          color={agentColor}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
