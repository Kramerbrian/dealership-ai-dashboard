'use client';

import React, { useState, useEffect } from 'react';
import { TierGate } from './TierGate';

interface EEATScoresProps {
  domain?: string;
  scores?: {
    expertise: number;
    experience: number;
    authoritativeness: number;
    trustworthiness: number;
    overall: number;
  };
}

export const EEATScores: React.FC<EEATScoresProps> = ({ domain, scores }) => {
  const [eeatData, setEeatData] = useState(scores);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (domain && !scores) {
      fetchEEATScores(domain);
    }
  }, [domain, scores]);

  const fetchEEATScores = async (domain: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/eeat?domain=${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('E-E-A-T scoring requires Pro or Enterprise tier');
        }
        throw new Error('Failed to fetch E-E-A-T scores');
      }
      
      const data = await response.json();
      setEeatData(data.eeatScores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load E-E-A-T scores');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const eeatMetrics = [
    {
      key: 'expertise',
      label: 'Expertise',
      description: 'Demonstrates knowledge and skill in automotive industry',
      icon: '🎓',
      tips: [
        'Showcase certifications and training',
        'Highlight team expertise',
        'Share industry knowledge content'
      ]
    },
    {
      key: 'experience',
      label: 'Experience',
      description: 'Proven track record and years in business',
      icon: '⏰',
      tips: [
        'Display years in business',
        'Show customer testimonials',
        'Highlight awards and recognition'
      ]
    },
    {
      key: 'authoritativeness',
      label: 'Authoritativeness',
      description: 'Recognition as a trusted source in the industry',
      icon: '🏆',
      tips: [
        'Get featured in industry publications',
        'Win awards and certifications',
        'Build thought leadership content'
      ]
    },
    {
      key: 'trustworthiness',
      label: 'Trustworthiness',
      description: 'Reliability and credibility with customers',
      icon: '🤝',
      tips: [
        'Maintain high review ratings',
        'Show transparent pricing',
        'Display security badges'
      ]
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">E-E-A-T Analysis Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => domain && fetchEEATScores(domain)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <TierGate requiredTier="PRO" feature="E-E-A-T Scoring">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900">E-E-A-T Analysis</h2>
          </div>
          <p className="text-gray-600">
            Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) 
            scoring for AI visibility optimization.
          </p>
        </div>

        {/* Overall Score */}
        {eeatData && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {eeatData.overall}/100
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(eeatData.overall)}`}>
                  {getScoreLabel(eeatData.overall)}
                </div>
                <p className="text-gray-600 mt-2">
                  Overall E-E-A-T Score
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Individual Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {eeatMetrics.map((metric) => {
            const score = eeatData?.[metric.key as keyof typeof eeatData] || 0;
            return (
              <div key={metric.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{metric.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{metric.label}</h3>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-gray-900">{score}/100</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
                    {getScoreLabel(score)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-green-500' : 
                      score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Improvement Tips */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Improvement Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eeatMetrics.map((metric) => {
              const score = eeatData?.[metric.key as keyof typeof eeatData] || 0;
              if (score >= 80) return null; // Skip tips for high scores
              
              return (
                <div key={metric.key} className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{metric.icon}</span>
                    <span className="font-medium text-gray-900">{metric.label}</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {metric.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => domain && fetchEEATScores(domain)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Analysis
          </button>
          <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </TierGate>
  );
};
