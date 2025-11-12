'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  Zap,
  ArrowRight,
  Eye,
  BarChart3,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import RelevanceOverlay from './RelevanceOverlay';
import RISimulator from './RISimulator';

interface DiagnosticIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number; // 0-100
  effort: 'low' | 'medium' | 'high';
  timeToFix: string;
  revenueAtRisk: number;
  description: string;
  fixable: boolean;
  category: 'schema' | 'content' | 'reviews' | 'technical' | 'competitive';
  competitors: {
    name: string;
    score: number;
  }[];
}

interface DiagnosticDashboardProps {
  domain: string;
  dealerId: string;
}

export default function DiagnosticDashboard({ domain, dealerId }: DiagnosticDashboardProps) {
  const [issues, setIssues] = useState<DiagnosticIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRelevanceOverlay, setShowRelevanceOverlay] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [currentRelevance, setCurrentRelevance] = useState(0);

  useEffect(() => {
    fetchDiagnostics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDiagnostics, 300000);
    return () => clearInterval(interval);
  }, [domain, dealerId]);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/diagnostics?domain=${encodeURIComponent(domain)}&dealerId=${dealerId}`);
      if (!res.ok) throw new Error('Failed to fetch diagnostics');
      
      const data = await res.json();
      setIssues(data.issues || []);
      setOverallScore(data.overallScore || 0);
      setCurrentRelevance(data.relevanceIndex || 0);
    } catch (error) {
      console.error('Diagnostic dashboard error:', error);
      // Fallback demo data
      setIssues(generateDemoIssues());
      setOverallScore(72);
      setCurrentRelevance(68);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoIssues = (): DiagnosticIssue[] => [
    {
      id: '1',
      title: 'Missing AutoDealer Schema',
      severity: 'critical',
      impact: 22,
      effort: 'low',
      timeToFix: '2 hours',
      revenueAtRisk: 8200,
      description: 'Critical structured data missing. AI can\'t parse your inventory.',
      fixable: true,
      category: 'schema',
      competitors: [
        { name: 'Naples Honda', score: 88 },
        { name: 'Crown Nissan', score: 75 },
      ],
    },
    {
      id: '2',
      title: 'Low Review Response Rate',
      severity: 'high',
      impact: 15,
      effort: 'low',
      timeToFix: '1 hour',
      revenueAtRisk: 3100,
      description: 'Only 23% of reviews have responses. AI trust score penalized.',
      fixable: true,
      category: 'reviews',
      competitors: [
        { name: 'Naples Honda', score: 92 },
        { name: 'Germain Toyota', score: 78 },
      ],
    },
    {
      id: '3',
      title: 'Incomplete FAQ Schema',
      severity: 'medium',
      impact: 12,
      effort: 'medium',
      timeToFix: '3 hours',
      revenueAtRisk: 2400,
      description: 'Missing 8 critical questions AI assistants look for.',
      fixable: true,
      category: 'content',
      competitors: [
        { name: 'Naples Honda', score: 85 },
        { name: 'Crown Nissan', score: 71 },
      ],
    },
    {
      id: '4',
      title: 'Competitor Outranking on Key Queries',
      severity: 'high',
      impact: 18,
      effort: 'high',
      timeToFix: '1 week',
      revenueAtRisk: 5600,
      description: 'Naples Honda ranks #1 on 5 high-value queries where you rank #3-4.',
      fixable: true,
      category: 'competitive',
      competitors: [
        { name: 'Naples Honda', score: 88 },
        { name: 'Crown Nissan', score: 75 },
      ],
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schema': return <Target className="w-4 h-4" />;
      case 'content': return <BarChart3 className="w-4 h-4" />;
      case 'reviews': return <Users className="w-4 h-4" />;
      case 'technical': return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const totalRevenueAtRisk = issues.reduce((sum, i) => sum + i.revenueAtRisk, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Real-Time Diagnostic Dashboard
            </h2>
            <p className="text-gray-400 text-sm">
              See where you stand and what to fix next to win the click (or zero-click) before your competitors
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Overall Score</div>
            <div className="text-5xl font-black text-emerald-400 tabular-nums">{overallScore}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Critical Issues</div>
            <div className="text-2xl font-bold text-red-400">{criticalIssues.length}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Revenue at Risk</div>
            <div className="text-2xl font-bold text-orange-400">${(totalRevenueAtRisk / 1000).toFixed(0)}K</div>
            <div className="text-xs text-gray-500">per month</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Quick Wins</div>
            <div className="text-2xl font-bold text-emerald-400">
              {issues.filter(i => i.effort === 'low' && i.impact >= 10).length}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Relevance Index</div>
            <div className="text-2xl font-bold text-purple-400">{currentRelevance}</div>
            <button
              onClick={() => setShowRelevanceOverlay(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 mt-1"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowRelevanceOverlay(true)}
          className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4 hover:border-emerald-500/50 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <div className="font-semibold text-white">See Your Relevance Overlay</div>
          </div>
          <div className="text-xs text-gray-400">
            Real-time query relevance analysis and competitor comparison
          </div>
        </button>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <RISimulator
            domain={domain}
            dealerId={dealerId}
            currentRelevance={currentRelevance}
            onSimulationComplete={(results) => {
              console.log('Simulation complete:', results);
            }}
          />
        </div>
      </div>

      {/* Issues List - Prioritized */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">What to Fix Next</h3>
          <div className="text-sm text-gray-400">
            Sorted by impact × urgency
          </div>
        </div>

        <div className="space-y-4">
          {issues
            .sort((a, b) => {
              const aPriority = (a.impact * (a.severity === 'critical' ? 4 : a.severity === 'high' ? 3 : a.severity === 'medium' ? 2 : 1));
              const bPriority = (b.impact * (b.severity === 'critical' ? 4 : b.severity === 'high' ? 3 : b.severity === 'medium' ? 2 : 1));
              return bPriority - aPriority;
            })
            .map((issue, idx) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`border rounded-xl p-5 ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(issue.category)}
                      <span className="font-bold text-white text-lg">{issue.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        issue.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{issue.description}</p>
                    
                    {/* Competitors */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">Competitors:</span>
                      {issue.competitors.map((comp, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2">
                          <span className="text-gray-300">{comp.name}</span>
                          <span className="text-emerald-400 font-semibold">{comp.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-3xl font-black text-red-400 mb-1">
                      ${(issue.revenueAtRisk / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-400">revenue at risk</div>
                    <div className="mt-3">
                      <div className="text-lg font-bold text-emerald-400">+{issue.impact}</div>
                      <div className="text-xs text-gray-400">points if fixed</div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{issue.timeToFix}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Effort: {issue.effort}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Impact: {issue.impact}pts</span>
                    </div>
                  </div>
                  {issue.fixable && (
                    <button 
                      onClick={() => handleFixIssue(issue)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      Fix Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Relevance Overlay Modal */}
      {showRelevanceOverlay && (
        <RelevanceOverlay
          domain={domain}
          dealerId={dealerId}
          isOpen={showRelevanceOverlay}
          onClose={() => setShowRelevanceOverlay(false)}
        />
      )}
    </div>
  );
}

