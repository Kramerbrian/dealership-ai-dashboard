'use client';

import { useState } from 'react';
import { Eye, Target, Users, MapPin, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface FivePillarsProps {
  dealership: any;
  latestScore: any;
}

export function FivePillars({ dealership, latestScore }: FivePillarsProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const pillars = [
    {
      id: 'ai-visibility',
      name: 'AI Visibility',
      score: latestScore?.aiVisibility || 0,
      icon: Eye,
      color: 'blue',
      description: 'How well AI platforms can find and understand your dealership',
      metrics: [
        { name: 'Schema Markup', value: 85, status: 'good' },
        { name: 'Structured Data', value: 72, status: 'warning' },
        { name: 'Content Quality', value: 90, status: 'good' },
        { name: 'Technical SEO', value: 68, status: 'warning' }
      ],
      recommendations: [
        'Implement vehicle schema markup on inventory pages',
        'Add business hours and contact information to structured data',
        'Optimize page titles and meta descriptions for AI understanding'
      ]
    },
    {
      id: 'zero-click-shield',
      name: 'Zero-Click Shield',
      score: latestScore?.zeroClickShield || 0,
      icon: Target,
      color: 'purple',
      description: 'Protection against zero-click searches and featured snippets',
      metrics: [
        { name: 'FAQ Content', value: 45, status: 'poor' },
        { name: 'How-to Guides', value: 30, status: 'poor' },
        { name: 'Answer Optimization', value: 60, status: 'warning' },
        { name: 'Snippet Readiness', value: 75, status: 'good' }
      ],
      recommendations: [
        'Create comprehensive FAQ section with common customer questions',
        'Develop how-to guides for car buying process',
        'Structure content to answer specific customer queries'
      ]
    },
    {
      id: 'ugc-health',
      name: 'UGC Health',
      score: latestScore?.ugcHealth || 0,
      icon: Users,
      color: 'green',
      description: 'User-generated content quality and sentiment',
      metrics: [
        { name: 'Review Response Rate', value: 95, status: 'good' },
        { name: 'Review Sentiment', value: 78, status: 'good' },
        { name: 'Review Volume', value: 45, status: 'warning' },
        { name: 'Review Recency', value: 85, status: 'good' }
      ],
      recommendations: [
        'Increase review volume through customer follow-up campaigns',
        'Respond to all reviews within 24 hours',
        'Encourage satisfied customers to leave reviews'
      ]
    },
    {
      id: 'geo-trust',
      name: 'Geo Trust',
      score: latestScore?.geoTrust || 0,
      icon: MapPin,
      color: 'orange',
      description: 'Local search presence and geographic trust signals',
      metrics: [
        { name: 'Google Business Profile', value: 90, status: 'good' },
        { name: 'Local Citations', value: 65, status: 'warning' },
        { name: 'NAP Consistency', value: 85, status: 'good' },
        { name: 'Local Reviews', value: 70, status: 'warning' }
      ],
      recommendations: [
        'Complete and optimize Google Business Profile',
        'Ensure NAP consistency across all platforms',
        'Build local citations on relevant directories'
      ]
    },
    {
      id: 'sgp-integrity',
      name: 'SGP Integrity',
      score: latestScore?.sgpIntegrity || 0,
      icon: Shield,
      color: 'red',
      description: 'Search engine optimization and technical health',
      metrics: [
        { name: 'Page Speed', value: 55, status: 'warning' },
        { name: 'Mobile Optimization', value: 80, status: 'good' },
        { name: 'Crawl Errors', value: 95, status: 'good' },
        { name: 'Internal Linking', value: 60, status: 'warning' }
      ],
      recommendations: [
        'Optimize images and reduce page load times',
        'Improve internal linking structure',
        'Fix any crawl errors in Search Console'
      ]
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getMetricStatus = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedPillarData = pillars.find(p => p.id === selectedPillar);

  return (
    <div className="space-y-6">
      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className={`
                rounded-lg border-2 p-6 cursor-pointer transition-all duration-200
                ${selectedPillar === pillar.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => setSelectedPillar(selectedPillar === pillar.id ? null : pillar.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-6 w-6 text-${pillar.color}-600`} />
                  <h3 className="text-lg font-semibold text-gray-900">{pillar.name}</h3>
                </div>
                {getScoreIcon(pillar.score)}
              </div>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(pillar.score)}`}>
                {pillar.score.toFixed(1)}
              </div>

              <p className="text-sm text-gray-600 mt-3">{pillar.description}</p>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${pillar.color}-500 transition-all duration-300`}
                    style={{ width: `${pillar.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedPillarData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <selectedPillarData.icon className={`h-6 w-6 text-${selectedPillarData.color}-600`} />
              <h3 className="text-xl font-semibold text-gray-900">{selectedPillarData.name}</h3>
            </div>
            <button
              onClick={() => setSelectedPillar(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Metrics */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Metrics</h4>
              <div className="space-y-4">
                {selectedPillarData.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getMetricStatus(metric.status)}`}>
                        {metric.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h4>
              <div className="space-y-3">
                {selectedPillarData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>View Detailed Analysis</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Target className="h-4 w-4" />
              <span>Get Recommendations</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}