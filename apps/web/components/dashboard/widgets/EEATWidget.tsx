/**
 * E-E-A-T Widget
 * Experience, Expertise, Authoritativeness, and Trustworthiness scores
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, GraduationCap, Shield, Heart, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EEATWidgetProps {
  data: {
    experience: {
      score: number;
      signals: number;
      description: string;
    };
    expertise: {
      score: number;
      signals: number;
      description: string;
    };
    authoritativeness: {
      score: number;
      signals: number;
      description: string;
    };
    trustworthiness: {
      score: number;
      signals: number;
      description: string;
    };
    overallScore: number;
    conflicts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
}

export default function EEATWidget({ data }: EEATWidgetProps) {
  const pillars = [
    {
      key: 'experience',
      label: 'Experience',
      icon: Heart,
      color: 'blue',
      data: data.experience,
    },
    {
      key: 'expertise',
      label: 'Expertise',
      icon: GraduationCap,
      color: 'purple',
      data: data.expertise,
    },
    {
      key: 'authoritativeness',
      label: 'Authoritativeness',
      icon: Award,
      color: 'green',
      data: data.authoritativeness,
    },
    {
      key: 'trustworthiness',
      label: 'Trustworthiness',
      icon: Shield,
      color: 'orange',
      data: data.trustworthiness,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall E-E-A-T Score */}
      <Card>
        <CardHeader>
          <CardTitle>E-E-A-T Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className={`text-6xl font-bold ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}
                </div>
                <div className="text-4xl text-gray-400">/100</div>
              </div>
              <p className="text-sm text-gray-600">
                Experience • Expertise • Authoritativeness • Trustworthiness
              </p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={getScoreColor(data.overallScore)}
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - data.overallScore / 100) }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Four Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar, idx) => (
          <motion.div
            key={pillar.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <pillar.icon className={`w-6 h-6 text-${pillar.color}-600`} />
                  <CardTitle>{pillar.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-gray-900">{pillar.data.score}</span>
                    <span className="text-sm text-gray-600">/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pillar.data.score}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-3 rounded-full ${getScoreBgColor(pillar.data.score)}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{pillar.data.description}</p>
                  <p className="text-xs text-gray-500">
                    {pillar.data.signals} signals detected
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conflicts */}
      {data.conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <CardTitle>Detected Conflicts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.conflicts.map((conflict, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    conflict.severity === 'high' ? 'bg-red-50 border-red-500' :
                    conflict.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{conflict.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      conflict.severity === 'high' ? 'bg-red-100 text-red-800' :
                      conflict.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {conflict.severity.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

