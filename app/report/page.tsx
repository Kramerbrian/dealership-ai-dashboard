'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ViralShareWidget from '@/components/viral/ViralShareWidget';

interface ReportData {
  domain: string;
  scores: {
    aiVisibility: number;
    zeroClickShield: number;
    ugcHealth: number;
    geoTrust: number;
    sgpIntegrity: number;
    overall: number;
  };
  quickWins: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    estimatedIncrease: number;
  }>;
  competitors: Array<{
    name: string;
    score: number;
    gap: number;
  }>;
}

function ReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const domain = searchParams.get('domain') || '';
  const userEmail = searchParams.get('email') || '';

  useEffect(() => {
    if (domain) {
      generateReport();
    }
  }, [domain]);

  const generateReport = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock report data
    const mockReport: ReportData = {
      domain,
      scores: {
        aiVisibility: Math.floor(Math.random() * 30) + 40, // 40-70
        zeroClickShield: Math.floor(Math.random() * 30) + 50, // 50-80
        ugcHealth: Math.floor(Math.random() * 30) + 45, // 45-75
        geoTrust: Math.floor(Math.random() * 30) + 55, // 55-85
        sgpIntegrity: Math.floor(Math.random() * 30) + 35, // 35-65
        overall: 0
      },
      quickWins: [
        {
          title: 'Add Schema Markup',
          description: 'Implement structured data for vehicles and reviews',
          impact: 'high',
          effort: 'low',
          estimatedIncrease: 15
        },
        {
          title: 'Optimize Google Business Profile',
          description: 'Complete all sections and add recent photos',
          impact: 'high',
          effort: 'low',
          estimatedIncrease: 12
        },
        {
          title: 'Improve Review Response Rate',
          description: 'Respond to all reviews within 24 hours',
          impact: 'medium',
          effort: 'low',
          estimatedIncrease: 8
        }
      ],
      competitors: [
        { name: 'Competitor A', score: 78, gap: 8 },
        { name: 'Competitor B', score: 72, gap: 2 },
        { name: 'Competitor C', score: 65, gap: -5 }
      ]
    };

    // Calculate overall score
    mockReport.scores.overall = Math.round(
      (mockReport.scores.aiVisibility + 
       mockReport.scores.zeroClickShield + 
       mockReport.scores.ugcHealth + 
       mockReport.scores.geoTrust + 
       mockReport.scores.sgpIntegrity) / 5
    );

    setReportData(mockReport);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Dealership</h2>
          <p className="text-gray-600">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to generate report for this domain.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚗</div>
              <span className="text-xl font-bold text-gray-900">DealershipAI</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Visibility Report
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Analysis for <span className="font-semibold">{reportData.domain}</span>
          </p>
          <div className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall AI Visibility Score</h2>
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {reportData.scores.overall}/100
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${
              getScoreBgColor(reportData.scores.overall)
            } ${getScoreColor(reportData.scores.overall)}`}>
              {reportData.scores.overall >= 80 ? 'Excellent' : 
               reportData.scores.overall >= 60 ? 'Good' : 
               reportData.scores.overall >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
            <p className="text-gray-600 mt-4">
              {reportData.scores.overall >= 80 
                ? 'Great job! You\'re highly visible to AI platforms.' 
                : reportData.scores.overall >= 60 
                  ? 'Good visibility, but there\'s room for improvement.' 
                  : 'Your AI visibility needs significant improvement.'}
            </p>
          </div>
        </motion.div>

        {/* Detailed Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            { key: 'aiVisibility', label: 'AI Visibility', icon: '🤖', weight: '35%' },
            { key: 'zeroClickShield', label: 'Zero-Click Shield', icon: '🛡️', weight: '20%' },
            { key: 'ugcHealth', label: 'UGC Health', icon: '💬', weight: '20%' },
            { key: 'geoTrust', label: 'Geo Trust', icon: '📍', weight: '15%' },
            { key: 'sgpIntegrity', label: 'SGP Integrity', icon: '📊', weight: '10%' }
          ].map((metric, index) => {
            const score = reportData.scores[metric.key as keyof typeof reportData.scores];
            return (
              <div key={metric.key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{metric.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{metric.label}</h3>
                    <p className="text-sm text-gray-600">{metric.weight}</p>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {score}/100
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
        </motion.div>

        {/* Quick Wins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quick Wins</h2>
          <div className="space-y-4">
            {reportData.quickWins.map((win, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{win.title}</h3>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(win.impact)}`}>
                      {win.impact} impact
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(win.effort)}`}>
                      {win.effort} effort
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{win.description}</p>
                <div className="text-sm text-blue-600 font-medium">
                  +{win.estimatedIncrease} points potential increase
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Competitors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚔️ Competitive Analysis</h2>
          <div className="space-y-4">
            {reportData.competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                  <p className="text-sm text-gray-600">
                    {competitor.gap > 0 ? 'Beating you by' : 'Behind you by'} {Math.abs(competitor.gap)} points
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{competitor.score}/100</div>
                  <div className={`text-sm ${
                    competitor.gap > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {competitor.gap > 0 ? 'Behind' : 'Ahead'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Want More Insights?</h2>
          <p className="text-xl text-blue-100 mb-6">
            Get unlimited analysis, E-E-A-T scoring, and competitive intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/sign-up')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Pricing
            </button>
          </div>

          {/* Viral Share Widget */}
          {reportData && (
            <div className="mt-12">
              <ViralShareWidget 
                auditData={{
                  dealershipName: reportData.domain,
                  rank: reportData.scores.overall > 80 ? 2 : reportData.scores.overall > 60 ? 5 : 8,
                  totalCompetitors: 12,
                  aiVisibility: reportData.scores.aiVisibility,
                  quickWins: reportData.quickWins.length,
                  competitors: [
                    { name: 'Competitor A', score: 92.1 },
                    { name: 'Competitor B', score: 78.9 },
                    { name: 'Competitor C', score: 85.3 }
                  ]
                }}
                onShare={(platform, message) => {
                  console.log(`Shared on ${platform}:`, message);
                }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Report</h2>
          <p className="text-white/60">Generating your AI visibility report...</p>
        </div>
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
