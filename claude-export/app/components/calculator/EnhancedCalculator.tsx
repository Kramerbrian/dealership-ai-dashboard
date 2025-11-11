'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Zap,
  Download,
  Share2,
  MessageSquare,
  Brain,
  BarChart3,
  PieChart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface CalculatorInputs {
  monthlyUnits: number;
  averageGross: number;
  currentEfficiency: number;
  currentCosts: number;
  currentLeads: number;
  dealershipSize: 'small' | 'medium' | 'large';
  marketType: 'urban' | 'suburban' | 'rural';
  aiAdoption: 'low' | 'medium' | 'high';
}

interface CalculatorResults {
  costSavings: number;
  grossProfitIncrease: number;
  additionalUnits: number;
  additionalLeads: number;
  totalOpportunity: number;
  roi: number;
  paybackPeriod: number;
  aiImpact: number;
  competitiveAdvantage: number;
}

interface AIInsights {
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  nextSteps: string[];
}

export default function EnhancedCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyUnits: 50,
    averageGross: 2500,
    currentEfficiency: 75,
    currentCosts: 100000,
    currentLeads: 200,
    dealershipSize: 'medium',
    marketType: 'suburban',
    aiAdoption: 'medium'
  });

  const [results, setResults] = useState<CalculatorResults>({
    costSavings: 0,
    grossProfitIncrease: 0,
    additionalUnits: 0,
    additionalLeads: 0,
    totalOpportunity: 0,
    roi: 0,
    paybackPeriod: 0,
    aiImpact: 0,
    competitiveAdvantage: 0
  });

  const [aiInsights, setAiInsights] = useState<AIInsights>({
    recommendations: [],
    risks: [],
    opportunities: [],
    nextSteps: []
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'insights' | 'export'>('calculator');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Enhanced calculation with AI factors
  const calculateOpportunity = async () => {
    const { monthlyUnits, averageGross, currentEfficiency, currentCosts, currentLeads, dealershipSize, marketType, aiAdoption } = inputs;
    
    // Base calculations
    const efficiencyGain = (100 - currentEfficiency) / 100;
    const costSavings = currentCosts * efficiencyGain * 0.3;
    const grossProfitIncrease = monthlyUnits * averageGross * efficiencyGain * 0.2;
    const additionalUnits = Math.round(monthlyUnits * efficiencyGain * 0.15);
    const additionalLeads = Math.round(currentLeads * efficiencyGain * 0.25);
    
    // AI enhancement factors
    const aiMultiplier = aiAdoption === 'high' ? 1.5 : aiAdoption === 'medium' ? 1.2 : 1.0;
    const sizeMultiplier = dealershipSize === 'large' ? 1.3 : dealershipSize === 'medium' ? 1.0 : 0.8;
    const marketMultiplier = marketType === 'urban' ? 1.2 : marketType === 'suburban' ? 1.0 : 0.9;
    
    const totalMultiplier = aiMultiplier * sizeMultiplier * marketMultiplier;
    
    const totalOpportunity = (costSavings + grossProfitIncrease + (additionalUnits * averageGross)) * totalMultiplier;
    const roi = (totalOpportunity / 499) * 100; // Based on $499/month pricing
    const paybackPeriod = 499 / (totalOpportunity / 12);
    const aiImpact = (totalMultiplier - 1) * 100;
    const competitiveAdvantage = Math.min(aiImpact * 2, 100);

    setResults({
      costSavings: Math.round(costSavings),
      grossProfitIncrease: Math.round(grossProfitIncrease),
      additionalUnits,
      additionalLeads,
      totalOpportunity: Math.round(totalOpportunity),
      roi: Math.round(roi),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      aiImpact: Math.round(aiImpact),
      competitiveAdvantage: Math.round(competitiveAdvantage)
    });

    // Generate AI insights
    await generateAIInsights();
  };

  const generateAIInsights = async () => {
    // Simulate AI-powered insights based on inputs
    const insights: AIInsights = {
      recommendations: [
        "Implement AI-powered lead scoring to improve conversion rates",
        "Optimize your Google My Business profile for local AI searches",
        "Create FAQ content targeting voice search queries",
        "Set up automated review response system"
      ],
      risks: [
        "Competitors with higher AI adoption may capture market share",
        "Voice search optimization gap could impact local visibility",
        "Manual processes may become inefficient as market evolves"
      ],
      opportunities: [
        "AI Overviews present new visibility opportunities",
        "Voice search optimization can capture early adopters",
        "Automated customer service can improve satisfaction scores"
      ],
      nextSteps: [
        "Schedule a demo to see DealershipAI in action",
        "Start with a free AI visibility audit",
        "Join our webinar on AI optimization strategies"
      ]
    };

    setAiInsights(insights);
  };

  useEffect(() => {
    calculateOpportunity();
  }, [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting to PDF...');
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    console.log('Exporting to CSV...');
  };

  const shareResults = () => {
    // Implementation for sharing
    console.log('Sharing results...');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">DealershipAI Calculator</h1>
                <p className="text-sm text-gray-500">AI-Powered Opportunity Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={shareResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'insights', label: 'AI Insights', icon: Brain },
              { id: 'export', label: 'Export & Share', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Input Section */}
              <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Dealership Metrics</span>
                </h2>
                
                <div className="space-y-6">
                  {/* Basic Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Units Sold</label>
                      <input
                        type="number"
                        value={inputs.monthlyUnits}
                        onChange={(e) => handleInputChange('monthlyUnits', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Average Gross Profit ($)</label>
                      <input
                        type="number"
                        value={inputs.averageGross}
                        onChange={(e) => handleInputChange('averageGross', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Efficiency (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={inputs.currentEfficiency}
                        onChange={(e) => handleInputChange('currentEfficiency', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Costs ($)</label>
                      <input
                        type="number"
                        value={inputs.currentCosts}
                        onChange={(e) => handleInputChange('currentCosts', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Leads</label>
                    <input
                      type="number"
                      value={inputs.currentLeads}
                      onChange={(e) => handleInputChange('currentLeads', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Dealership Size</label>
                        <select
                          value={inputs.dealershipSize}
                          onChange={(e) => handleInputChange('dealershipSize', e.target.value as any)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="small">Small (1-25 units)</option>
                          <option value="medium">Medium (26-100 units)</option>
                          <option value="large">Large (100+ units)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Market Type</label>
                        <select
                          value={inputs.marketType}
                          onChange={(e) => handleInputChange('marketType', e.target.value as any)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="urban">Urban</option>
                          <option value="suburban">Suburban</option>
                          <option value="rural">Rural</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">AI Adoption</label>
                        <select
                          value={inputs.aiAdoption}
                          onChange={(e) => handleInputChange('aiAdoption', e.target.value as any)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Opportunity Analysis</span>
                </h2>
                
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                      <div className="text-2xl font-bold text-green-600">
                        ${results.totalOpportunity.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Opportunity</div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <div className="text-2xl font-bold text-blue-600">
                        {results.roi}%
                      </div>
                      <div className="text-sm text-gray-600">ROI</div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost Savings</span>
                      <span className="font-semibold">${results.costSavings.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gross Profit Increase</span>
                      <span className="font-semibold">${results.grossProfitIncrease.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Additional Units</span>
                      <span className="font-semibold">+{results.additionalUnits}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Additional Leads</span>
                      <span className="font-semibold">+{results.additionalLeads}</span>
                    </div>
                  </div>

                  {/* AI Impact */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">AI Impact</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      +{results.aiImpact}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Competitive Advantage: {results.competitiveAdvantage}%
                    </div>
                  </div>

                  {/* Payback Period */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Payback Period</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {results.paybackPeriod} months
                    </div>
                    <div className="text-sm text-gray-600">
                      Based on $499/month investment
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* AI Insights */}
              <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI-Powered Insights</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>Recommendations</span>
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span>Opportunities</span>
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.opportunities.map((opp, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span>Risks</span>
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.risks.map((risk, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <ArrowRight className="w-5 h-5 text-purple-600" />
                      <span>Next Steps</span>
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Export Options */}
              <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span>Export & Share</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* PDF Export */}
                  <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Download className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-medium">PDF Report</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive analysis with charts and recommendations
                    </p>
                    <button
                      onClick={exportToPDF}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>

                  {/* CSV Export */}
                  <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-medium">CSV Data</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Raw data for further analysis in Excel or other tools
                    </p>
                    <button
                      onClick={exportToCSV}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download CSV
                    </button>
                  </div>

                  {/* Share Results */}
                  <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Share2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-medium">Share Results</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share your analysis with team members or stakeholders
                    </p>
                    <button
                      onClick={shareResults}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Share Link
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
