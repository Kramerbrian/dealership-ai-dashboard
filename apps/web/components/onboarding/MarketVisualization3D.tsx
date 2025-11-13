'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { DiscoveryResult } from '@/lib/onboarding/auto-discovery';

interface MarketVisualization3DProps {
  discoveryData: DiscoveryResult;
  className?: string;
}

/**
 * Dealer marker in 3D space
 */
function DealerMarker({
  position,
  name,
  isMainDealer,
  pulseScore,
  reviewCount,
  onClick,
}: {
  position: [number, number, number];
  name: string;
  isMainDealer: boolean;
  pulseScore?: number;
  reviewCount?: number;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Pulse animation
  useFrame((state) => {
    if (meshRef.current && isMainDealer) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = isMainDealer
    ? '#8b5cf6' // Purple for main dealer
    : pulseScore && pulseScore > 75
    ? '#10b981' // Green for high-performing competitors
    : pulseScore && pulseScore > 50
    ? '#f59e0b' // Amber for medium
    : '#ef4444'; // Red for low

  const size = isMainDealer ? 1.5 : 0.8;
  const height = reviewCount ? Math.min(reviewCount / 50, 5) : 1;

  return (
    <group position={position}>
      {/* Cylinder showing review volume */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
        castShadow
      >
        <cylinderGeometry args={[size, size, height, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : isMainDealer ? 0.3 : 0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Pulse score sphere on top */}
      {pulseScore && (
        <mesh position={[0, height / 2 + 0.5, 0]} castShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, height / 2 + 1.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {name}
      </Text>

      {/* Info on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, height / 2 + 2.5, 0]}>
          <div className="bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-lg px-4 py-3 shadow-2xl min-w-[200px]">
            <div className="text-white font-bold text-sm mb-2">{name}</div>
            {pulseScore && (
              <div className="text-gray-300 text-xs mb-1">
                Pulse Score: <span className="text-purple-400 font-bold">{pulseScore}</span>
              </div>
            )}
            {reviewCount && (
              <div className="text-gray-300 text-xs mb-1">
                Reviews: <span className="text-blue-400 font-bold">{reviewCount}</span>
              </div>
            )}
            {isMainDealer && (
              <div className="text-purple-400 text-xs font-bold mt-2">Your Dealership</div>
            )}
          </div>
        </Html>
      )}

      {/* Base circle */}
      <mesh position={[0, -height / 2 - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[size * 1.2, size * 1.5, 32]} />
        <meshBasicMaterial color={color} opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

/**
 * Connection lines between dealers
 */
function ConnectionLines({
  dealers,
}: {
  dealers: Array<{ position: [number, number, number]; name: string }>;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);

  useEffect(() => {
    if (!linesRef.current || dealers.length < 2) return;

    const points: THREE.Vector3[] = [];
    const mainDealer = dealers[0];

    // Connect main dealer to all competitors
    dealers.slice(1).forEach((competitor) => {
      points.push(new THREE.Vector3(...mainDealer.position));
      points.push(new THREE.Vector3(...competitor.position));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    linesRef.current.geometry = geometry;
  }, [dealers]);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#8b5cf6" opacity={0.2} transparent />
    </lineSegments>
  );
}

/**
 * Grid floor
 */
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

/**
 * 3D Scene content
 */
function Scene({ discoveryData }: { discoveryData: DiscoveryResult }) {
  const { camera } = useThree();

  useEffect(() => {
    // Position camera for optimal view
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Convert discovery data to 3D positions
  const mainDealer = {
    position: [0, 0, 0] as [number, number, number],
    name: discoveryData.dealerInfo.name,
    pulseScore: 82, // Demo score
    reviewCount: discoveryData.reviewPlatforms.reduce((sum, p) => sum + (p.reviewCount || 0), 0),
    isMainDealer: true,
  };

  const competitors = discoveryData.competitors.map((comp, index) => {
    // Distribute competitors in a circle
    const angle = (index / discoveryData.competitors.length) * Math.PI * 2;
    const radius = comp.distance * 2;

    return {
      position: [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      name: comp.name,
      pulseScore: (comp.rating || 0) * 20, // Convert 5-star rating to 100-point scale
      reviewCount: comp.reviewCount,
      isMainDealer: false,
    };
  });

  const allDealers = [mainDealer, ...competitors];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#3b82f6" />

      {/* Environment */}
      <Environment preset="night" />
      <fog attach="fog" args={['#000000', 20, 50]} />

      {/* Grid floor */}
      <GridFloor />

      {/* Dealer markers */}
      {allDealers.map((dealer, index) => (
        <DealerMarker key={index} {...dealer} />
      ))}

      {/* Connection lines */}
      <ConnectionLines dealers={allDealers} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={40}
      />
    </>
  );
}

/**
 * Main 3D Market Visualization Component
 */
export default function MarketVisualization3D({
  discoveryData,
  className = '',
}: MarketVisualization3DProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-950 rounded-xl`}>
        <div className="text-white">Loading 3D visualization...</div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-xl overflow-hidden shadow-2xl`}>
      <Canvas shadows className="bg-gray-950">
        <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={50} />
        <Suspense
          fallback={
            <Html center>
              <div className="text-white text-lg">Loading scene...</div>
            </Html>
          }
        >
          <Scene discoveryData={discoveryData} />
        </Suspense>
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 rounded-lg px-4 py-3 shadow-2xl">
        <div className="text-white font-bold text-sm mb-2">Market Position</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">Your Dealership</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300">Strong Competitor (75+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-300">Medium Competitor (50-75)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-300">Weak Competitor (&lt;50)</span>
          </div>
        </div>
        <div className="text-gray-400 text-xs mt-3 border-t border-gray-700 pt-2">
          Height = Review Volume | Distance = Physical Distance
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 rounded-lg px-3 py-2 shadow-2xl">
        <div className="text-gray-400 text-xs">
          🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      </div>
    </div>
  );
}
