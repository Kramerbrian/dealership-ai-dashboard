'use client';

import { useState, useEffect } from 'react';

interface ComplianceData {
  score: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  lastChecked: string;
}

export default function GooglePolicyComplianceCard() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call for compliance data
    const fetchComplianceData = async () => {
      try {
        // Mock data for now - in production this would come from an API
        const mockData: ComplianceData = {
          score: 87,
          issues: [
            {
              type: 'Content Quality',
              severity: 'medium',
              description: 'Some product descriptions lack sufficient detail',
              recommendation: 'Add more comprehensive product information'
            },
            {
              type: 'Image Optimization',
              severity: 'low',
              description: 'Some images missing alt text',
              recommendation: 'Add descriptive alt text to all images'
            }
          ],
          lastChecked: new Date().toISOString()
        };
        
        setData(mockData);
      } catch (err) {
        setError('Failed to load compliance data');
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl p-5 bg-white/70 backdrop-blur shadow-sm border border-zinc-100">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-200 rounded"></div>
            <div className="h-4 bg-zinc-200 rounded"></div>
            <div className="h-4 bg-zinc-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-5 bg-white/70 backdrop-blur shadow-sm border border-zinc-100">
        <div className="text-center">
          <div className="text-red-500 text-sm">Error loading compliance data</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-white/70 backdrop-blur shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-zinc-900 font-semibold">Google Policy Compliance</h3>
        <span className="text-xs text-zinc-500">
          Last checked: {new Date(data.lastChecked).toLocaleDateString()}
        </span>
      </div>

      {/* Compliance Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-600">Compliance Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
            {data.score}%
          </span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              data.score >= 90 ? 'bg-green-500' : 
              data.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${data.score}%` }}
          ></div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-700">Issues Found</h4>
        {data.issues.length === 0 ? (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            ✅ No compliance issues found
          </div>
        ) : (
          <div className="space-y-2">
            {data.issues.map((issue, index) => (
              <div key={index} className="p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-900">
                    {issue.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 mb-2">{issue.description}</p>
                <p className="text-xs text-zinc-500 italic">{issue.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Run Compliance Check
        </button>
      </div>
    </div>
  );
}