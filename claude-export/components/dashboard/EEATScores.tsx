/**
 * E-E-A-T Scores Component
 * Pro+ feature for detailed E-E-A-T analysis
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TierGate } from '@/components/ui/tier-gate';
import { EEATScore } from '@/lib/eeat-scoring-client';

interface EEATScoresProps {
  currentTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  dealershipId: string;
}

const METRIC_ICONS = {
  expertise: Shield,
  experience: Award,
  authoritativeness: Users,
  trustworthiness: CheckCircle
};

const METRIC_COLORS = {
  expertise: 'text-blue-600',
  experience: 'text-green-600',
  authoritativeness: 'text-purple-600',
  trustworthiness: 'text-orange-600'
};

const METRIC_GRADIENTS = {
  expertise: 'from-blue-50 to-blue-100',
  experience: 'from-green-50 to-green-100',
  authoritativeness: 'from-purple-50 to-purple-100',
  trustworthiness: 'from-orange-50 to-orange-100'
};

export function EEATScores({ currentTier, dealershipId }: EEATScoresProps) {
  const [eeatData, setEeatData] = useState<EEATScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEEATData();
  }, [dealershipId]);

  const fetchEEATData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/eeat/calculate?dealershipId=${dealershipId}`);
      const data = await response.json();
      
      if (data.success) {
        setEeatData(data.data);
      } else {
        setError(data.error || 'Failed to fetch E-E-A-T data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 80) return { label: 'Good', variant: 'secondary' as const };
    if (score >= 70) return { label: 'Fair', variant: 'outline' as const };
    if (score >= 60) return { label: 'Poor', variant: 'destructive' as const };
    return { label: 'Critical', variant: 'destructive' as const };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing E-E-A-T signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchEEATData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!eeatData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No E-E-A-T data available</p>
      </div>
    );
  }

  const metrics = [
    { key: 'expertise', label: 'Expertise', score: eeatData.expertise },
    { key: 'experience', label: 'Experience', score: eeatData.experience },
    { key: 'authoritativeness', label: 'Authoritativeness', score: eeatData.authoritativeness },
    { key: 'trustworthiness', label: 'Trustworthiness', score: eeatData.trustworthiness }
  ];

  return (
    <TierGate 
      requiredTier="PRO" 
      currentTier={currentTier}
      feature="eeat_scoring"
      className="space-y-6"
    >
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-800">
              E-E-A-T Analysis
            </CardTitle>
            <CardDescription>
              Expertise, Experience, Authoritativeness, Trustworthiness
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {eeatData.overall}
            </div>
            <Badge {...getScoreBadge(eeatData.overall)} className="text-lg px-4 py-2">
              {getScoreBadge(eeatData.overall).label}
            </Badge>
            <p className="text-gray-600 mt-4">
              {eeatData.overall >= 80 
                ? 'Strong E-E-A-T signals that boost AI visibility'
                : 'E-E-A-T signals need improvement for better AI visibility'
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => {
          const Icon = METRIC_ICONS[metric.key as keyof typeof METRIC_ICONS];
          const colorClass = METRIC_COLORS[metric.key as keyof typeof METRIC_COLORS];
          const gradientClass = METRIC_GRADIENTS[metric.key as keyof typeof METRIC_GRADIENTS];
          
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${gradientClass} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/80`}>
                      <Icon className={`w-6 h-6 ${colorClass}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${colorClass}`}>
                        {metric.label}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${colorClass}`}>
                          {metric.score}
                        </span>
                        <Badge {...getScoreBadge(metric.score)}>
                          {getScoreBadge(metric.score).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress 
                      value={metric.score} 
                      className="h-2"
                    />
                    <div className="text-sm text-gray-600">
                      {metric.score >= 80 
                        ? 'Excellent performance in this area'
                        : metric.score >= 70
                        ? 'Good performance with room for improvement'
                        : 'Needs attention to improve AI visibility'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eeatData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eeatData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TierGate>
  );
}
