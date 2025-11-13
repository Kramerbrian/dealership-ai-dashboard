'use client';
import { useState, useEffect } from 'react';

interface UGCData {
  platform: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  count: number;
  responseRate: number;
  avgResponseTime: number;
  crisisLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function CompetitiveUGC() {
  const [ugcData, setUgcData] = useState<UGCData[]>([]);
  const [forecastDays, setForecastDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate UGC data fetch
    const mockData: UGCData[] = [
      {
        platform: 'Google Reviews',
        sentiment: 'positive',
        count: 127,
        responseRate: 89,
        avgResponseTime: 2.3,
        crisisLevel: 'low'
      },
      {
        platform: 'Yelp',
        sentiment: 'negative',
        count: 23,
        responseRate: 45,
        avgResponseTime: 5.1,
        crisisLevel: 'high'
      },
      {
        platform: 'Facebook',
        sentiment: 'neutral',
        count: 89,
        responseRate: 67,
        avgResponseTime: 3.2,
        crisisLevel: 'medium'
      }
    ];
    
    setTimeout(() => {
      setUgcData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getCrisisColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>📊</span>
          Competitive UGC Monitor
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Forecast:</label>
          <select 
            value={forecastDays} 
            onChange={(e) => setForecastDays(Number(e.target.value))}
            className="text-xs border rounded px-2 py-1"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {ugcData.map((platform, index) => (
          <div key={index} className="p-3 rounded-lg border bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSentimentIcon(platform.sentiment)}</span>
                <span className="font-medium">{platform.platform}</span>
                <span className={`px-2 py-1 rounded text-xs border ${getCrisisColor(platform.crisisLevel)}`}>
                  {platform.crisisLevel}
                </span>
              </div>
              <span className="text-sm font-semibold">{platform.count} reviews</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Response Rate:</span> {platform.responseRate}%
              </div>
              <div>
                <span className="font-medium">Avg Response:</span> {platform.avgResponseTime}d
              </div>
            </div>

            {platform.crisisLevel === 'high' || platform.crisisLevel === 'critical' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                <strong>Action Required:</strong> High negative sentiment detected. 
                <button className="ml-2 text-red-600 underline">View Crisis Plan</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Next forecast update in 2h 15m</span>
          <button className="text-blue-600 hover:text-blue-800">Export Report</button>
        </div>
      </div>
    </div>
  );
}
