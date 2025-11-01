'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Shield, 
  Zap, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Users,
  Activity,
  Brain,
  Lightbulb,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

interface DTRIResult {
  dtri: {
    score: number;
    qaiScore: number;
    eeatScore: number;
  };
  financialImpact: {
    decayTaxCost: number;
    aroiScore: number;
    strategicWindowValue: number;
    totalValue: number;
  };
  qai: {
    overallScore: number;
    components: any[];
    lagMeasures: any[];
    recommendations: string[];
  };
  eeat: {
    overallScore: number;
    components: any;
    trustSignals: any[];
    recommendations: string[];
  };
  autonomous: {
    actions: string[];
    contentBlueprints: any[];
  };
  recommendations: string[];
  externalContext: {
    tsm: number;
    competitivePosition: string;
  };
}

const DTRI_Dashboard: React.FC = () => {
  const [data, setData] = useState<DTRIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'qai' | 'eeat' | 'financial' | 'autonomous'>('overview');

  // Sample data for demonstration
  const sampleData: DTRIResult = {
    dtri: {
      score: 0.82,
      qaiScore: 0.85,
      eeatScore: 0.79
    },
    financialImpact: {
      decayTaxCost: 12500,
      aroiScore: 2.4,
      strategicWindowValue: 45000,
      totalValue: 57500
    },
    qai: {
      overallScore: 0.85,
      components: [
        { id: 'QAI-FTFR', score: 0.88, weight: 0.35, name: 'First Time Fix Rate' },
        { id: 'QAI-VDPD', score: 0.82, weight: 0.30, name: 'VDP Dominance' },
        { id: 'QAI-PROC', score: 0.85, weight: 0.20, name: 'Process Excellence' },
        { id: 'QAI-CERT', score: 0.87, weight: 0.15, name: 'Certification Compliance' }
      ],
      lagMeasures: [
        { id: 'LAG-CERT-COMPLIANCE', status: 'compliant', actionRequired: 'None', owner: 'Service_Director' },
        { id: 'LAG-VDP-DOMSIZE', status: 'warning', actionRequired: 'Optimize VDP performance', owner: 'CTO/CMO' }
      ],
      recommendations: [
        'Implement automated lead response system',
        'Optimize VDP loading performance',
        'Schedule additional training for technicians'
      ]
    },
    eeat: {
      overallScore: 0.79,
      components: {
        trustworthiness: { score: 0.82, w: 0.40 },
        experience: { score: 0.78, w: 0.25 },
        expertise: { score: 0.75, w: 0.20 },
        authoritativeness: { score: 0.70, w: 0.15 }
      },
      trustSignals: [
        { type: 'Review Trust Signals', status: 'strong', actionRequired: 'Maintain current strategy', priority: 'low' },
        { type: 'User Experience Signals', status: 'moderate', actionRequired: 'Continue UX monitoring', priority: 'medium' }
      ],
      recommendations: [
        'Create authoritative content for AI citations',
        'Improve mobile user experience',
        'Build high-quality backlinks'
      ]
    },
    autonomous: {
      actions: ['EXECUTE_REVIEW_CRISIS_SOW'],
      contentBlueprints: [
        { id: 'G-EXPERT-BIO', actionableOutput: 'Generate E-E-A-T-optimized Author Bio Schema' }
      ]
    },
    recommendations: [
      'HIGH PRIORITY: Address QAI internal execution gaps',
      'Implement systematic review generation program',
      'Optimize VDP performance for better user experience'
    ],
    externalContext: {
      tsm: 1.15,
      competitivePosition: 'competitive'
    }
  };

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setData(sampleData);
      setLoading(false);
    }, 1500);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-50 border-emerald-200';
    if (score >= 0.8) return 'bg-blue-50 border-blue-200';
    if (score >= 0.7) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'strong':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
      case 'moderate':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'critical':
      case 'weak':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Analyzing DTRI data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">DTRI Analysis Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DTRI-MAXIMUS-MASTER-4.0</h1>
                <p className="text-sm text-slate-600">Digital Trust Revenue Index Autonomous Engine</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(data.dtri.score)}`}>
                  {(data.dtri.score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">DTRI Score</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'qai', label: 'QAI Internal', icon: <Shield className="w-4 h-4" /> },
              { id: 'eeat', label: 'E-E-A-T External', icon: <Users className="w-4 h-4" /> },
              { id: 'financial', label: 'Financial Impact', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'autonomous', label: 'Autonomous Actions', icon: <Zap className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* DTRI Score Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border-2 ${getScoreBgColor(data.dtri.score)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">DTRI Score</h3>
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(data.dtri.score)} mb-2`}>
                    {(data.dtri.score * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600">Overall Digital Trust Revenue Index</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">QAI Score</h3>
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(data.dtri.qaiScore)} mb-2`}>
                    {(data.dtri.qaiScore * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600">Internal Execution Quality</p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">E-E-A-T Score</h3>
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(data.dtri.eeatScore)} mb-2`}>
                    {(data.dtri.eeatScore * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-slate-600">External Perception Trust</p>
                </div>
              </div>

              {/* Financial Impact Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Decay Tax Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    ${data.financialImpact.decayTaxCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-700">Unnecessary ad spend</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">AROI Score</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.financialImpact.aroiScore.toFixed(1)}x
                  </div>
                  <div className="text-sm text-blue-700">Actionable ROI</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-900">Strategic Value</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    ${data.financialImpact.strategicWindowValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-700">Window opportunity</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Total Value</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${data.financialImpact.totalValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">Combined impact</div>
                </div>
              </div>

              {/* Key Recommendations */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Recommendations</h3>
                <div className="space-y-3">
                  {data.recommendations.slice(0, 5).map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'qai' && (
            <motion.div
              key="qai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">QAI Internal Execution Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.qai.components.map((component, index) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{component.name}</h4>
                        <div className={`text-xl font-bold ${getScoreColor(component.score)}`}>
                          {(component.score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            component.score >= 0.9 ? 'bg-emerald-500' :
                            component.score >= 0.8 ? 'bg-blue-500' :
                            component.score >= 0.7 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${component.score * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-slate-600">Weight: {(component.weight * 100).toFixed(0)}%</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'eeat' && (
            <motion.div
              key="eeat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">E-E-A-T External Perception Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(data.eeat.components).map(([key, component], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 capitalize">{key}</h4>
                        <div className={`text-xl font-bold ${getScoreColor(component.score)}`}>
                          {(component.score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            component.score >= 0.9 ? 'bg-emerald-500' :
                            component.score >= 0.8 ? 'bg-blue-500' :
                            component.score >= 0.7 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${component.score * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-slate-600">Weight: {(component.w * 100).toFixed(0)}%</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'financial' && (
            <motion.div
              key="financial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Impact Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-900">Decay Tax Cost</span>
                      <span className="text-lg font-bold text-red-600">
                        ${data.financialImpact.decayTaxCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">AROI Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {data.financialImpact.aroiScore.toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm font-medium text-emerald-900">Strategic Window Value</span>
                      <span className="text-lg font-bold text-emerald-600">
                        ${data.financialImpact.strategicWindowValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">External Context</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-900">Trust Sensitivity Multiplier</span>
                      <span className="text-lg font-bold text-slate-600">
                        {data.externalContext.tsm.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-900">Competitive Position</span>
                      <span className={`text-lg font-bold ${
                        data.externalContext.competitivePosition === 'ahead' ? 'text-emerald-600' :
                        data.externalContext.competitivePosition === 'behind' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {data.externalContext.competitivePosition}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'autonomous' && (
            <motion.div
              key="autonomous"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Autonomous Actions</h3>
                  <div className="space-y-3">
                    {data.autonomous.actions.map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <Zap className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">{action}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Blueprints</h3>
                  <div className="space-y-3">
                    {data.autonomous.contentBlueprints.map((blueprint, index) => (
                      <motion.div
                        key={blueprint.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="font-medium text-blue-900 mb-1">{blueprint.id}</div>
                        <div className="text-sm text-blue-700">{blueprint.actionableOutput}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DTRI_Dashboard;
