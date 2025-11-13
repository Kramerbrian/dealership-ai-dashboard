'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Users, Star, Eye, Zap } from 'lucide-react';
import { TierGate } from '@/components/TierGate';

interface CompetitiveIntelligenceProps {
  dealership: any;
  userTier: string;
}

export function CompetitiveIntelligence({ dealership, userTier }: CompetitiveIntelligenceProps) {
  const [competitiveData, setCompetitiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitiveData();
  }, []);

  const fetchCompetitiveData = async () => {
    try {
      const response = await fetch('/api/competitive');
      if (response.ok) {
        const data = await response.json();
        setCompetitiveData(data);
      }
    } catch (error) {
      console.error('Failed to fetch competitive data:', error);
    } finally {
      setLoading(false);
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

  const competitors = competitiveData?.competitors || [];
  const marketPosition = competitiveData?.marketPosition || {};
  const insights = competitiveData?.insights || [];

  return (
    <TierGate requiredTier="PRO" feature="Competitive Intelligence">
      <div className="space-y-6">
        {/* Market Position Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Market Position</h2>
              <p className="text-blue-100 mb-4">
                You rank #{marketPosition.userRank} of {marketPosition.totalCompetitors} competitors
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{marketPosition.userRank}</div>
                  <div className="text-sm text-blue-100">Your Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{marketPosition.opportunityScore}</div>
                  <div className="text-sm text-blue-100">Opportunity Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{marketPosition.marketGap}</div>
                  <div className="text-sm text-blue-100">Points Behind Leader</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Market Leader</div>
              <div className="text-xl font-semibold">{marketPosition.marketLeader}</div>
            </div>
          </div>
        </div>

        {/* Competitors Rankings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Competitor Rankings</h3>
            <p className="text-sm text-gray-600">Real-time competitive analysis</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {competitors.map((competitor: any, index: number) => (
                <div key={competitor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                      <p className="text-sm text-gray-600">{competitor.domain}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{competitor.aiScore}</div>
                      <div className="text-xs text-gray-500">AI Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{competitor.marketShare}%</div>
                      <div className="text-xs text-gray-500">Market Share</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {competitor.gap > 0 ? (
                        <div className="flex items-center space-x-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm font-medium">+{competitor.gap}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">{Math.abs(competitor.gap)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competitive Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-4">
              {insights.map((insight: any, index: number) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {insight.impact === 'high' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Target className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs font-medium text-blue-600">
                          ROI: ${insight.estimatedROI}
                        </span>
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Analyze Top Competitor</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Set Up Monitoring</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Get Quick Wins</span>
              </button>
            </div>
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.slice(0, 3).map((competitor: any, index: number) => (
              <div key={competitor.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AI Score</span>
                    <span className="font-medium">{competitor.aiScore}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Market Share</span>
                    <span className="font-medium">{competitor.marketShare}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gap</span>
                    <span className={`font-medium ${competitor.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {competitor.gap > 0 ? `+${competitor.gap}` : competitor.gap}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Strengths</div>
                  <div className="flex flex-wrap gap-1">
                    {competitor.strengths.slice(0, 2).map((strength: string, i: number) => (
                      <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Weaknesses</div>
                  <div className="flex flex-wrap gap-1">
                    {competitor.weaknesses.slice(0, 2).map((weakness: string, i: number) => (
                      <span key={i} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TierGate>
  );
}
