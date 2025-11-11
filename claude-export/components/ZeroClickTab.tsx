'use client';
import { useState, useEffect } from 'react';

interface ZeroClickData {
  domain: string;
  intent: string;
  inclusionRate: number;
  lastSeen: string;
  latency: number;
  platforms: Array<{
    name: string;
    visibility: number;
    weight: number;
  }>;
  zeroClickRisk: number;
  competitorGaps: Array<{
    competitor: string;
    gap: number;
  }>;
}

export default function ZeroClickTab() {
  const [data, setData] = useState<ZeroClickData | null>(null);
  const [selectedIntent, setSelectedIntent] = useState('general');
  const [loading, setLoading] = useState(true);

  const intents = [
    { key: 'general', label: 'General Search' },
    { key: 'vehicle', label: 'Vehicle Search' },
    { key: 'service', label: 'Service Search' },
    { key: 'parts', label: 'Parts Search' },
    { key: 'financing', label: 'Financing Search' }
  ];

  useEffect(() => {
    const fetchZeroClickData = async () => {
      try {
        const response = await fetch(`/api/zero-click?intent=${selectedIntent}&domain=example.com`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch zero-click data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZeroClickData();
  }, [selectedIntent]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
        <div className="text-center text-gray-500">
          <p>No zero-click data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🎯</span>
          Zero-Click Analysis
        </h3>
        <select 
          value={selectedIntent} 
          onChange={(e) => setSelectedIntent(e.target.value)}
          className="text-sm border rounded px-3 py-1"
        >
          {intents.map(intent => (
            <option key={intent.key} value={intent.key}>
              {intent.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Inclusion Rate</div>
          <div className="text-2xl font-bold text-blue-800">
            {(data.inclusionRate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600">
            Last seen: {new Date(data.lastSeen).toLocaleDateString()}
          </div>
        </div>

        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-sm text-orange-600 font-medium">Zero-Click Risk</div>
          <div className="text-2xl font-bold text-orange-800">
            {(data.zeroClickRisk * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-orange-600">
            Avg latency: {data.latency}ms
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Visibility</h4>
        <div className="space-y-2">
          {data.platforms.map((platform, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{platform.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${platform.visibility}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {platform.visibility.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.competitorGaps.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Competitor Gaps</h4>
          <div className="space-y-1">
            {data.competitorGaps.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{competitor.competitor}</span>
                <span className="text-red-600 font-medium">-{competitor.gap.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Data refreshed 2 minutes ago</span>
          <button className="text-blue-600 hover:text-blue-800">Export Data</button>
        </div>
      </div>
    </div>
  );
}
