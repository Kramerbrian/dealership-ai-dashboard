'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Users, Star, Eye } from 'lucide-react';

interface ExecutiveSummaryProps {
  dealership: any;
  latestScore: any;
  userTier: string;
}

export function ExecutiveSummary({ dealership, latestScore, userTier }: ExecutiveSummaryProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: dealership.domain })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const score = metrics?.score || latestScore || {
    overallScore: 0,
    aiVisibility: 0,
    zeroClickShield: 0,
    ugcHealth: 0,
    geoTrust: 0,
    sgpIntegrity: 0
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall QAI Score */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">QAI Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
                {score.overallScore.toFixed(1)}
              </p>
            </div>
            {getScoreIcon(score.overallScore)}
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {getTrendIcon(5.2)}
              <span className="text-sm text-gray-600">+5.2 from last month</span>
            </div>
          </div>
        </div>

        {/* AI Visibility */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Visibility</p>
              <p className={`text-3xl font-bold ${getScoreColor(score.aiVisibility)}`}>
                {score.aiVisibility.toFixed(1)}
              </p>
            </div>
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {getTrendIcon(3.1)}
              <span className="text-sm text-gray-600">+3.1 from last month</span>
            </div>
          </div>
        </div>

        {/* Zero-Click Shield */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Zero-Click Shield</p>
              <p className={`text-3xl font-bold ${getScoreColor(score.zeroClickShield)}`}>
                {score.zeroClickShield.toFixed(1)}
              </p>
            </div>
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {getTrendIcon(2.8)}
              <span className="text-sm text-gray-600">+2.8 from last month</span>
            </div>
          </div>
        </div>

        {/* UGC Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">UGC Health</p>
              <p className={`text-3xl font-bold ${getScoreColor(score.ugcHealth)}`}>
                {score.ugcHealth.toFixed(1)}
              </p>
            </div>
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {getTrendIcon(1.5)}
              <span className="text-sm text-gray-600">+1.5 from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5 Pillars Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">5 Pillars Breakdown</h3>
          <div className="space-y-4">
            {[
              { name: 'AI Visibility', score: score.aiVisibility, color: 'blue' },
              { name: 'Zero-Click Shield', score: score.zeroClickShield, color: 'purple' },
              { name: 'UGC Health', score: score.ugcHealth, color: 'green' },
              { name: 'Geo Trust', score: score.geoTrust, color: 'orange' },
              { name: 'SGP Integrity', score: score.sgpIntegrity, color: 'red' }
            ].map((pillar) => (
              <div key={pillar.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{pillar.name}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${pillar.color}-500`}
                      style={{ width: `${pillar.score}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(pillar.score)}`}>
                    {pillar.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'AI Visibility improved', time: '2 hours ago', type: 'positive' },
              { action: 'New competitor analysis', time: '1 day ago', type: 'info' },
              { action: 'Review response posted', time: '2 days ago', type: 'positive' },
              { action: 'Schema updated', time: '3 days ago', type: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'positive' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Run New Analysis</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">View Competitors</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Quick Wins</span>
          </button>
        </div>
      </div>
    </div>
  );
}