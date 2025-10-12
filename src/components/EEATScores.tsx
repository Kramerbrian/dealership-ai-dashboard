/**
 * DealershipAI v2.0 - E-E-A-T Scores Component
 * Pro+ tier only - displays Expertise, Experience, Authoritativeness, Trustworthiness
 */

import React, { useState, useEffect } from 'react';
import { TierGate } from './TierGate';

interface EEATScoresProps {
  domain: string;
  userId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  className?: string;
}

interface EEATData {
  expertise: number;
  experience: number;
  authoritativeness: number;
  trustworthiness: number;
  overall: number;
  lastUpdated: string;
}

export function EEATScores({ domain, userId, plan, className = '' }: EEATScoresProps) {
  const [eeatData, setEeatData] = useState<EEATData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan === 'PRO' || plan === 'ENTERPRISE') {
      fetchEEATData();
    }
  }, [domain, userId, plan]);

  const fetchEEATData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/eeat?domain=${domain}&userId=${userId}&plan=${plan}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('E-E-A-T analysis requires Pro+ tier');
          return;
        }
        throw new Error('Failed to fetch E-E-A-T data');
      }
      
      const data = await response.json();
      setEeatData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  return (
    <TierGate requiredTier="PRO" currentTier={plan}>
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">E-E-A-T Analysis</h3>
          <span className="text-sm text-gray-500">
            {eeatData?.lastUpdated ? `Updated ${new Date(eeatData.lastUpdated).toLocaleDateString()}` : ''}
          </span>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={fetchEEATData}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {eeatData && !loading && (
          <>
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {eeatData.overall.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mb-4">Overall E-E-A-T Score</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${eeatData.overall}%` }}
                />
              </div>
            </div>

            {/* Individual Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard
                title="Expertise"
                score={eeatData.expertise}
                description="Knowledge and credentials"
                icon="🎓"
              />
              <ScoreCard
                title="Experience"
                score={eeatData.experience}
                description="Years in business"
                icon="⏰"
              />
              <ScoreCard
                title="Authoritativeness"
                score={eeatData.authoritativeness}
                description="Industry recognition"
                icon="🏆"
              />
              <ScoreCard
                title="Trustworthiness"
                score={eeatData.trustworthiness}
                description="Transparency and security"
                icon="🛡️"
              />
            </div>

            {/* Recommendations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {eeatData.expertise < 60 && (
                  <div>• Add staff credentials and certifications to your website</div>
                )}
                {eeatData.experience < 60 && (
                  <div>• Highlight years in business and customer testimonials</div>
                )}
                {eeatData.authoritativeness < 60 && (
                  <div>• Showcase awards, media mentions, and industry partnerships</div>
                )}
                {eeatData.trustworthiness < 60 && (
                  <div>• Add privacy policy, terms of service, and contact information</div>
                )}
                {eeatData.overall >= 80 && (
                  <div className="text-green-600">• Excellent E-E-A-T scores! Keep up the great work.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </TierGate>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  icon: string;
}

function ScoreCard({ title, score, description, icon }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </div>
      </div>
      <div className="font-medium text-gray-900 text-sm mb-1">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}