'use client';

import { useState, useEffect } from 'react';
import { Zap, Clock, DollarSign, Target, CheckCircle, AlertTriangle, Star, TrendingUp } from 'lucide-react';
import { TierGate } from '@/components/TierGate';

interface QuickWinsProps {
  dealership: any;
  userTier: string;
}

export function QuickWins({ dealership, userTier }: QuickWinsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (recommendationId: string) => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_completed',
          recommendationId
        })
      });
      
      if (response.ok) {
        setRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, status: 'completed' }
              : rec
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark as completed:', error);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    if (filter === 'critical') return rec.priority === 'critical';
    if (filter === 'high') return rec.priority === 'high';
    if (filter === 'low-effort') return rec.effort === 'low';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TierGate requiredTier="PRO" feature="Quick Wins">
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
              <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Wins</h2>
              <p className="text-gray-600 mt-1">
                AI-powered recommendations to improve your visibility
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                <div className="text-sm text-gray-500">Total Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recommendations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
              </div>
      </div>

      {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'critical', label: 'Critical' },
              { key: 'high', label: 'High Priority' },
              { key: 'low-effort', label: 'Low Effort' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
                  </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`bg-white rounded-lg border-2 p-6 transition-all duration-200 ${
                recommendation.status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.title}
                    </h3>
                    {recommendation.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{recommendation.description}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                  {recommendation.priority}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(recommendation.effort)}`}>
                  {recommendation.effort} effort
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                  {recommendation.impact} impact
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">${recommendation.estimatedROI}</span>
                  </div>
                  <div className="text-xs text-gray-500">ROI</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{recommendation.estimatedTime}h</span>
                  </div>
                  <div className="text-xs text-gray-500">Time</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-purple-600">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">{Math.round(recommendation.confidence * 100)}%</span>
                  </div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
              </div>

              {/* Steps */}
              {recommendation.steps && recommendation.steps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Implementation Steps</h4>
                  <div className="space-y-2">
                    {recommendation.steps.slice(0, 3).map((step: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <span>{step.title}</span>
                      </div>
                    ))}
                    {recommendation.steps.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{recommendation.steps.length - 3} more steps
                      </div>
                    )}
                  </div>
              </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {recommendation.automated && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Automated
                    </span>
                  )}
                  {recommendation.oneClickFix && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      One-Click Fix
                    </span>
                  )}
                </div>
                
                {recommendation.status !== 'completed' && (
                  <button
                    onClick={() => markCompleted(recommendation.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark Complete</span>
                  </button>
                )}
                  </div>
                </div>
        ))}
      </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.filter(r => r.priority === 'critical').length}
              </div>
              <div className="text-sm text-gray-500">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendations.filter(r => r.effort === 'low').length}
              </div>
              <div className="text-sm text-gray-500">Low Effort</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${recommendations.reduce((sum, r) => sum + r.estimatedROI, 0)}
              </div>
              <div className="text-sm text-gray-500">Total ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {recommendations.reduce((sum, r) => sum + r.estimatedTime, 0)}h
              </div>
              <div className="text-sm text-gray-500">Total Time</div>
            </div>
          </div>
        </div>
    </div>
    </TierGate>
  );
}