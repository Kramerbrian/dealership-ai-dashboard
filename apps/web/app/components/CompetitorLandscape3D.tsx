"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Types
interface CompetitorPosition {
  id: string;
  name: string;
  position: [number, number, number]; // x: SEO, y: Traffic, z: Domain Authority
  size: number; // Market share
  color: string;
  metrics: {
    seo: number;
    traffic: number;
    domainAuthority: number;
    marketShare: number;
    revenue: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastUpdate: Date;
}

interface LandscapeMetrics {
  totalCompetitors: number;
  averageSEOScore: number;
  averageTraffic: number;
  marketLeader: string;
  yourPosition: number;
  marketDensity: number;
}

// 3D Competitor Sphere Component
const CompetitorSphere = ({ 
  competitor, 
  isSelected, 
  onSelect 
}: { 
  competitor: CompetitorPosition; 
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = competitor.position[1] + Math.sin(state.clock.elapsedTime + competitor.position[0]) * 0.5;
      
      // Rotation for visual interest
      meshRef.current.rotation.y += 0.01;
      
      // Pulsing effect for selected competitor
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const handleClick = () => {
    onSelect(competitor.id);
  };

  return (
    <group position={competitor.position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.2 : 1}
      >
        <sphereGeometry args={[competitor.size, 32, 32]} />
        <meshStandardMaterial 
          color={competitor.color}
          emissive={isSelected ? competitor.color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          transparent
          opacity={hovered ? 0.8 : 0.7}
        />
      </mesh>
      
      {/* Competitor name label */}
      <Text
        position={[0, competitor.size + 1, 0]}
        fontSize={0.5}
        color={isSelected ? '#ffffff' : '#cccccc'}
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
      >
        {competitor.name}
      </Text>

      {/* Metrics display on hover */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="competitor-tooltip">
            <h3>{competitor.name}</h3>
            <div className="tooltip-metrics">
              <div>SEO: {competitor.metrics.seo}%</div>
              <div>Traffic: {competitor.metrics.traffic.toLocaleString()}</div>
              <div>DA: {competitor.metrics.domainAuthority}</div>
              <div>Market Share: {competitor.metrics.marketShare}%</div>
              <div>Revenue: ${(competitor.metrics.revenue / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Your Dealership Cube Component
const YourDealership = ({ 
  position, 
  metrics 
}: { 
  position: [number, number, number]; 
  metrics: CompetitorPosition['metrics'];
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color="#4caf50"
          emissive="#4caf50"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        Your Dealership
      </Text>
    </group>
  );
};

// Grid Component
const Grid = () => {
  return (
    <gridHelper args={[20, 20, '#444444', '#222222']} />
  );
};

// Axes Component
const Axes = () => {
  return (
    <group>
      {/* X-axis (SEO) */}
      <Text position={[10, 0, 0]} fontSize={0.5} color="#2196F3" anchorX="center">
        SEO Score
      </Text>
      {/* Y-axis (Traffic) */}
      <Text position={[0, 10, 0]} fontSize={0.5} color="#ff9800" anchorX="center">
        Traffic
      </Text>
      {/* Z-axis (Domain Authority) */}
      <Text position={[0, 0, 10]} fontSize={0.5} color="#f44336" anchorX="center">
        Domain Authority
      </Text>
    </group>
  );
};

// Main 3D Landscape Component
const CompetitorLandscape3D = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'seo' | 'traffic' | 'authority'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const competitors: CompetitorPosition[] = [
    {
      id: '1',
      name: 'AutoMax Dealership',
      position: [8.5, 9.2, 8.8],
      size: 1.5,
      color: '#ff6b6b',
      metrics: {
        seo: 92.1,
        traffic: 2100,
        domainAuthority: 88,
        marketShare: 35,
        revenue: 450000
      },
      trend: 'up',
      lastUpdate: new Date()
    },
    {
      id: '2',
      name: 'Premier Motors',
      position: [7.2, 7.8, 7.5],
      size: 1.2,
      color: '#4ecdc4',
      metrics: {
        seo: 88.7,
        traffic: 1800,
        domainAuthority: 75,
        marketShare: 28,
        revenue: 380000
      },
      trend: 'down',
      lastUpdate: new Date()
    },
    {
      id: '3',
      name: 'Elite Auto Group',
      position: [6.8, 6.5, 6.2],
      size: 1.0,
      color: '#45b7d1',
      metrics: {
        seo: 85.4,
        traffic: 1650,
        domainAuthority: 62,
        marketShare: 25,
        revenue: 320000
      },
      trend: 'stable',
      lastUpdate: new Date()
    },
    {
      id: '4',
      name: 'Metro Auto Sales',
      position: [5.5, 5.8, 5.0],
      size: 0.8,
      color: '#f9ca24',
      metrics: {
        seo: 78.2,
        traffic: 1200,
        domainAuthority: 50,
        marketShare: 12,
        revenue: 180000
      },
      trend: 'up',
      lastUpdate: new Date()
    }
  ];

  const yourDealership: CompetitorPosition = {
    id: 'yours',
    name: 'Your Dealership',
    position: [7.8, 7.2, 7.0],
    size: 1.0,
    color: '#4caf50',
    metrics: {
      seo: 87.3,
      traffic: 1580,
      domainAuthority: 70,
      marketShare: 12,
      revenue: 280000
    },
    trend: 'up',
    lastUpdate: new Date()
  };

  const landscapeMetrics: LandscapeMetrics = {
    totalCompetitors: competitors.length,
    averageSEOScore: competitors.reduce((sum, c) => sum + c.metrics.seo, 0) / competitors.length,
    averageTraffic: competitors.reduce((sum, c) => sum + c.metrics.traffic, 0) / competitors.length,
    marketLeader: competitors[0].name,
    yourPosition: 2,
    marketDensity: 0.75
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCompetitorSelect = (id: string) => {
    setSelectedCompetitor(selectedCompetitor === id ? null : id);
  };

  const selectedCompetitorData = selectedCompetitor 
    ? competitors.find(c => c.id === selectedCompetitor)
    : null;

  if (isLoading) {
    return (
      <div className="landscape-loading">
        <div className="loading-spinner"></div>
        <p>Loading 3D competitor landscape...</p>
      </div>
    );
  }

  return (
    <div className="competitor-landscape-3d">
      <div className="landscape-header">
        <h2>🌐 3D Competitor Landscape</h2>
        <p>Interactive visualization of your competitive position in 3D space</p>
      </div>

      {/* Controls */}
      <div className="landscape-controls">
        <div className="view-modes">
          <button 
            className={viewMode === 'overview' ? 'active' : ''}
            onClick={() => setViewMode('overview')}
          >
            Overview
          </button>
          <button 
            className={viewMode === 'seo' ? 'active' : ''}
            onClick={() => setViewMode('seo')}
          >
            SEO Focus
          </button>
          <button 
            className={viewMode === 'traffic' ? 'active' : ''}
            onClick={() => setViewMode('traffic')}
          >
            Traffic Focus
          </button>
          <button 
            className={viewMode === 'authority' ? 'active' : ''}
            onClick={() => setViewMode('authority')}
          >
            Authority Focus
          </button>
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4caf50' }}></div>
            <span>Your Dealership</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
            <span>Competitors</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [15, 15, 15], fov: 60 }}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Grid />
          <Axes />
          
          {/* Competitors */}
          {competitors.map((competitor) => (
            <CompetitorSphere
              key={competitor.id}
              competitor={competitor}
              isSelected={selectedCompetitor === competitor.id}
              onSelect={handleCompetitorSelect}
            />
          ))}
          
          {/* Your Dealership */}
          <YourDealership 
            position={yourDealership.position}
            metrics={yourDealership.metrics}
          />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Canvas>
      </div>

      {/* Metrics Panel */}
      <div className="metrics-panel">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Market Position</h3>
            <div className="metric-value">#{landscapeMetrics.yourPosition}</div>
            <div className="metric-label">out of {landscapeMetrics.totalCompetitors + 1}</div>
          </div>
          <div className="metric-card">
            <h3>Average SEO</h3>
            <div className="metric-value">{landscapeMetrics.averageSEOScore.toFixed(1)}%</div>
            <div className="metric-label">vs your {yourDealership.metrics.seo}%</div>
          </div>
          <div className="metric-card">
            <h3>Market Leader</h3>
            <div className="metric-value">{landscapeMetrics.marketLeader}</div>
            <div className="metric-label">35% market share</div>
          </div>
          <div className="metric-card">
            <h3>Market Density</h3>
            <div className="metric-value">{(landscapeMetrics.marketDensity * 100).toFixed(0)}%</div>
            <div className="metric-label">competitive intensity</div>
          </div>
        </div>
      </div>

      {/* Selected Competitor Details */}
      {selectedCompetitorData && (
        <div className="competitor-details">
          <h3>{selectedCompetitorData.name} Analysis</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">SEO Score</span>
              <span className="detail-value">{selectedCompetitorData.metrics.seo}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Monthly Traffic</span>
              <span className="detail-value">{selectedCompetitorData.metrics.traffic.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Domain Authority</span>
              <span className="detail-value">{selectedCompetitorData.metrics.domainAuthority}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Market Share</span>
              <span className="detail-value">{selectedCompetitorData.metrics.marketShare}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Annual Revenue</span>
              <span className="detail-value">${(selectedCompetitorData.metrics.revenue / 1000).toFixed(0)}K</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Trend</span>
              <span className={`detail-value trend-${selectedCompetitorData.trend}`}>
                {selectedCompetitorData.trend === 'up' ? '↗' : selectedCompetitorData.trend === 'down' ? '↘' : '→'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorLandscape3D;
