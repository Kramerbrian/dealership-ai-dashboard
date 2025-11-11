'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

interface Prediction {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  actionable: boolean;
  recommendations: string[];
}

interface AIPredictiveInsightsProps {
  tenantId: string;
}

export default function AIPredictiveInsights({ tenantId }: AIPredictiveInsightsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate AI-powered predictions
    setTimeout(() => {
      setPredictions([
        {
          id: '1',
          type: 'opportunity',
          title: 'AI Visibility Surge Predicted',
          description: 'Based on current trends, your AI visibility is expected to increase by 15-20% in the next 30 days due to improved content optimization.',
          confidence: 87,
          impact: 'high',
          timeframe: '30 days',
          actionable: true,
          recommendations: [
            'Optimize vehicle descriptions with AI-friendly keywords',
            'Implement structured data markup for inventory',
            'Create FAQ pages for common customer questions'
          ]
        },
        {
          id: '2',
          type: 'risk',
          title: 'Competitor Threat Detected',
          description: 'Local competitor is rapidly improving their AI presence. Without action, you may lose 8-12% market share in 60 days.',
          confidence: 73,
          impact: 'medium',
          timeframe: '60 days',
          actionable: true,
          recommendations: [
            'Accelerate content creation schedule',
            'Monitor competitor pricing strategies',
            'Enhance local SEO optimization'
          ]
        },
        {
          id: '3',
          type: 'trend',
          title: 'Seasonal Traffic Pattern',
          description: 'Historical data shows 25% traffic increase during Q4. Prepare inventory and marketing campaigns accordingly.',
          confidence: 94,
          impact: 'high',
          timeframe: 'Q4 2024',
          actionable: true,
          recommendations: [
            'Stock up on popular vehicle models',
            'Launch holiday marketing campaigns',
            'Prepare for increased customer inquiries'
          ]
        },
        {
          id: '4',
          type: 'optimization',
          title: 'Content Performance Gap',
          description: 'Your service pages are underperforming compared to industry benchmarks. Optimization could increase conversions by 12-18%.',
          confidence: 81,
          impact: 'medium',
          timeframe: '45 days',
          actionable: true,
          recommendations: [
            'Add customer testimonials to service pages',
            'Include pricing transparency',
            'Optimize for mobile experience'
          ]
        }
      ]);
      setLoading(false);
    }, 2000);
  }, [tenantId]);

  const filteredPredictions = predictions.filter(prediction => 
    selectedFilter === 'all' || prediction.type === selectedFilter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'trend':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'optimization':
        return <Zap className="w-5 h-5 text-purple-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50';
      case 'risk':
        return 'border-red-200 bg-red-50';
      case 'trend':
        return 'border-blue-200 bg-blue-50';
      case 'optimization':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI is analyzing your data...</p>
            <p className="text-sm text-gray-500 mt-2">Generating predictive insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Predictive Insights</h2>
            <p className="text-gray-600">Machine learning-powered predictions and recommendations</p>
          </div>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'opportunity', 'risk', 'trend', 'optimization'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPredictions.map((prediction) => (
          <div
            key={prediction.id}
            className={`p-6 rounded-xl border-2 ${getTypeColor(prediction.type)} transition-all duration-200 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(prediction.type)}
                <div>
                  <h3 className="font-semibold text-gray-900">{prediction.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                      {prediction.impact} impact
                    </span>
                    <span className="text-xs text-gray-500">
                      {prediction.timeframe}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {prediction.confidence}% confidence
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {prediction.description}
            </p>
            
            {prediction.actionable && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Recommended Actions:</h4>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Implement Recommendations
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Model Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Model Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">94.2%</div>
            <div className="text-sm text-gray-600">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">2.3s</div>
            <div className="text-sm text-gray-600">Avg. Processing Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1.2M</div>
            <div className="text-sm text-gray-600">Data Points Analyzed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
