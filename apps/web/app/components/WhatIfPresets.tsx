'use client';

import { useState } from 'react';

interface Preset {
  id: string;
  name: string;
  description: string;
  expectedLift: number;
  icon: string;
  parameters: Record<string, any>;
}

const PRESETS: Preset[] = [
  {
    id: 'photo-pack',
    name: 'Photo Pack',
    description: 'Add 20+ high-quality vehicle photos',
    expectedLift: 0.9,
    icon: '📸',
    parameters: { photos: 20, quality: 'high', angles: ['exterior', 'interior', 'engine'] }
  },
  {
    id: 'schema-full',
    name: 'Schema Full',
    description: 'Complete structured data markup',
    expectedLift: 0.8,
    icon: '🏗️',
    parameters: { schema: 'full', types: ['Vehicle', 'LocalBusiness', 'FAQ'] }
  },
  {
    id: 'gbp-parity',
    name: 'GBP Parity',
    description: 'Sync Google Business Profile data',
    expectedLift: 0.4,
    icon: '📍',
    parameters: { gbp_sync: true, hours: true, contact: true }
  },
  {
    id: 'faq-x5',
    name: 'FAQ ×5',
    description: 'Add 5 comprehensive FAQ sections',
    expectedLift: 0.35,
    icon: '❓',
    parameters: { faq_count: 5, topics: ['pricing', 'financing', 'warranty', 'service', 'trade'] }
  }
];

export default function WhatIfPresets({ tenantId }: { tenantId: string }) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSimulation = async (preset: Preset) => {
    setSimulating(true);
    setSelectedPreset(preset.id);
    
    try {
      const response = await fetch(`/api/tenants/${tenantId}/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: preset.id,
          parameters: preset.parameters,
          expectedLift: preset.expectedLift
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Simulation failed:', error);
      setResult({ error: 'Simulation failed' });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-medium mb-3">What-if Presets</div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => runSimulation(preset)}
            disabled={simulating}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selectedPreset === preset.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${simulating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{preset.icon}</span>
              <span className="text-sm font-medium">{preset.name}</span>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              {preset.description}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600 font-medium">
                +{preset.expectedLift} AIV
              </span>
              {simulating && selectedPreset === preset.id && (
                <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {result && (
        <div className="border-t pt-3">
          {result.error ? (
            <div className="text-sm text-red-600">
              ❌ {result.error}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600">
                ✅ Simulation Complete
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-600">Expected AIV Lift:</div>
                  <div className="font-medium">+{result.expectedLift?.toFixed(1) || 0}%</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Confidence:</div>
                  <div className="font-medium">{result.confidence || 'High'}</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Implementation:</div>
                  <div className="font-medium">{result.estimatedDays || '3-5'} days</div>
                </div>
                
                <div>
                  <div className="text-gray-600">ROI:</div>
                  <div className="font-medium">${result.estimatedROI || '2,400'}/month</div>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View detailed impact analysis →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Presets are based on industry benchmarks and your current performance data.
        </div>
      </div>
    </div>
  );
}
