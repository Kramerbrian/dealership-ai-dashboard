'use client';

import React, { useState } from 'react';
import AdminLiveStatus from '../components/AdminLiveStatus';
import DealerGPT2 from '../components/DealerGPT2';
import BotParityDiffViewer from '../components/BotParityDiffViewer';
import APIUsageChart from '../components/APIUsageChart';
import ViralReportComponent from '../components/ViralReportComponent';

export default function TestComponentsPage() {
  const [activeComponent, setActiveComponent] = useState('admin');

  const mockAPIUsageData = [
    { t: '08:00', calls: 12, errors: 0, latency: 150 },
    { t: '09:00', calls: 18, errors: 1, latency: 120 },
    { t: '10:00', calls: 9, errors: 0, latency: 180 },
    { t: '11:00', calls: 22, errors: 2, latency: 140 },
    { t: '12:00', calls: 15, errors: 0, latency: 160 },
    { t: '13:00', calls: 28, errors: 1, latency: 130 },
    { t: '14:00', calls: 19, errors: 0, latency: 170 },
    { t: '15:00', calls: 31, errors: 3, latency: 110 }
  ];

  const components = [
    { id: 'admin', name: 'Admin Live Status', description: 'Real-time system monitoring widget' },
    { id: 'dealer-gpt', name: 'DealerGPT 2.0', description: 'Voice-enabled AI assistant' },
    { id: 'bot-parity', name: 'Bot Parity Viewer', description: 'AI bot comparison tool' },
    { id: 'api-usage', name: 'API Usage Chart', description: 'Usage analytics visualization' },
    { id: 'viral-report', name: 'Viral Report', description: 'Shareable KPI reports' }
  ];

  const handlePlaybookLaunch = (playbook: string) => {
    alert(`Launching playbook: ${playbook}`);
  };

  const handleAnomalyExplain = (anomaly: any) => {
    console.log('Anomaly detected:', anomaly);
    alert(`Anomaly: ${anomaly.type} - ${anomaly.metric} changed by ${anomaly.change}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">DealershipAI 2026 Component Test Suite</h1>
          <p className="text-gray-600 mt-2">Test all new components and integrations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Component Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Component to Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((component) => (
              <button
                key={component.id}
                onClick={() => setActiveComponent(component.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  activeComponent === component.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-900">{component.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{component.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Component Display */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {components.find(c => c.id === activeComponent)?.name}
          </h2>
          
          <div className="min-h-[600px]">
            {activeComponent === 'admin' && (
              <div>
                <p className="text-gray-600 mb-4">
                  The AdminLiveStatus widget should appear in the bottom-right corner.
                  To test: Set <code className="bg-gray-100 px-2 py-1 rounded">localStorage.setItem('isAdmin', 'true')</code> in browser console and refresh.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Test Instructions:</h3>
                  <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                    <li>Open browser console (F12)</li>
                    <li>Run: <code>localStorage.setItem('isAdmin', 'true')</code></li>
                    <li>Refresh the page</li>
                    <li>Look for floating widget in bottom-right</li>
                    <li>Click widget to expand and see system status</li>
                  </ol>
                </div>
              </div>
            )}

            {activeComponent === 'dealer-gpt' && (
              <div className="h-[600px]">
                <DealerGPT2 
                  onPlaybookLaunch={handlePlaybookLaunch}
                  onAnomalyExplain={handleAnomalyExplain}
                />
              </div>
            )}

            {activeComponent === 'bot-parity' && (
              <div>
                <BotParityDiffViewer />
              </div>
            )}

            {activeComponent === 'api-usage' && (
              <div>
                <APIUsageChart 
                  points={mockAPIUsageData}
                  showErrors={true}
                  showLatency={true}
                  title="API Usage (Hourly) - Test Data"
                />
              </div>
            )}

            {activeComponent === 'viral-report' && (
              <div>
                <ViralReportComponent />
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🧪 Testing Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Admin Status Widget</h4>
              <ul className="space-y-1 text-blue-700">
                <li>✅ Widget appears for admin users</li>
                <li>✅ Status updates every 5 seconds</li>
                <li>✅ Expand/collapse functionality</li>
                <li>✅ System metrics display</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">DealerGPT 2.0</h4>
              <ul className="space-y-1 text-blue-700">
                <li>✅ Voice input works</li>
                <li>✅ Voice output works</li>
                <li>✅ Anomaly detection</li>
                <li>✅ Playbook suggestions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Bot Parity Viewer</h4>
              <ul className="space-y-1 text-blue-700">
                <li>✅ Bot comparison data</li>
                <li>✅ Schema detection</li>
                <li>✅ Expand/collapse details</li>
                <li>✅ Status indicators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">API Usage Chart</h4>
              <ul className="space-y-1 text-blue-700">
                <li>✅ Chart renders with data</li>
                <li>✅ Trend indicators</li>
                <li>✅ Multiple metrics</li>
                <li>✅ Responsive design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Live Status Widget - Always present */}
      <AdminLiveStatus />
    </div>
  );
}
