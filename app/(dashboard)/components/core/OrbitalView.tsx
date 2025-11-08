"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

type NodeDatum = {
  id: string;
  label: string;
  value: number;    // 0..100 -> node size
  urgency: number;  // 0..1 -> radial distance
  color: string;    // tailwind-ish hex or #RRGGBB
};

type Props = {
  nodes: NodeDatum[];     // map to sphere positions
  onSelect?: (id: string) => void;
};

export default function OrbitalView({ nodes, onSelect }: Props) {
  const positions = useMemo(() => {
    const angleStep = (Math.PI * 2) / Math.max(1, nodes.length);
    return nodes.map((n, i) => {
      const radius = 2 + n.urgency * 3;   // radial distance = base + scaled
      const a = i * angleStep;
      return {
        id: n.id,
        label: n.label,
        value: n.value,
        color: n.color,
        position: new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)
      };
    });
  }, [nodes]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden bg-white/5">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 4, 6]} intensity={0.6} />
        <OrbitControls enablePan={false} enableZoom={false} />
        <CenterNode />
        {positions.map((p) => (
          <NodeSphere
            key={p.id}
            id={p.id}
            label={p.label}
            value={p.value}
            color={p.color}
            position={p.position}
            onSelect={onSelect}
          />
        ))}
      </Canvas>
    </div>
  );
}

function CenterNode() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.9, 32, 32]} />
      <meshStandardMaterial color={"#0ea5e9"} emissive={"#0ea5e9"} emissiveIntensity={0.5} />
      <Html center>
        <div className="px-2 py-1 rounded bg-sky-600/80 text-white text-xs">
          DTRI
        </div>
      </Html>
    </mesh>
  );
}

function NodeSphere({
  id,
  label,
  value,
  color,
  position,
  onSelect
}: {
  id: string;
  label: string;
  value: number;
  color: string;
  position: THREE.Vector3;
  onSelect?: (id: string) => void;
}) {
  const scale = 0.6 + (value / 100) * 0.8; // 0.6..1.4
  return (
    <group position={position.toArray()}>
      <mesh
        onClick={() => onSelect?.(id)}
        scale={[scale, scale, scale]}
      >
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <Html distanceFactor={10}>
        <div className="text-center">
          <div className="text-white text-xs font-medium">{label}</div>
          <div className="text-white/80 text-[10px]">{Math.round(value)}%</div>
        </div>
      </Html>
    </group>
  );
}
