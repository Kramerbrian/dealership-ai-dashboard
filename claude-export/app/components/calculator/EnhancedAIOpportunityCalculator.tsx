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
  Info,
  Globe,
  MapPin,
  Search,
  Shield,
  Activity,
  Award,
  Star
} from 'lucide-react';

interface AIEnhancedInputs {
  // Basic dealership metrics
  monthlyUnits: number;
  averageGross: number;
  currentEfficiency: number;
  currentCosts: number;
  currentLeads: number;
  
  // Dealership characteristics
  dealershipSize: 'small' | 'medium' | 'large';
  marketType: 'urban' | 'suburban' | 'rural';
  aiAdoption: 'low' | 'medium' | 'high';
  
  // AI Visibility Metrics (from actual scans)
  currentQAI: number;
  currentPIQR: number;
  currentOVI: number;
  currentVAI: number;
  currentDTRI: number;
  
  // Competitive context
  competitorQAI: number;
  marketAverageQAI: number;
  industryBenchmark: number;
}

interface AIEnhancedResults {
  // Traditional opportunity metrics
  costSavings: number;
  grossProfitIncrease: number;
  additionalUnits: number;
  additionalLeads: number;
  totalOpportunity: number;
  roi: number;
  paybackPeriod: number;
  
  // AI-specific metrics
  aiImpact: number;
  competitiveAdvantage: number;
  visibilityGain: number;
  trustImprovement: number;
  authorityBoost: number;
  
  // Score improvements
  qaiImprovement: number;
  piqrReduction: number;
  oviIncrease: number;
  vaiIncrease: number;
  dtriImprovement: number;
  
  // Financial impact breakdown
  revenueAtRisk: number;
  marketShareGain: number;
  customerLifetimeValue: number;
  brandEquityIncrease: number;
}

interface AIInsights {
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  nextSteps: string[];
  competitiveAnalysis: string[];
  marketOpportunities: string[];
}

export default function EnhancedAIOpportunityCalculator() {
  const [inputs, setInputs] = useState<AIEnhancedInputs>({
    monthlyUnits: 50,
    averageGross: 2500,
    currentEfficiency: 75,
    currentCosts: 100000,
    currentLeads: 200,
    dealershipSize: 'medium',
    marketType: 'suburban',
    aiAdoption: 'medium',
    currentQAI: 65,
    currentPIQR: 35,
    currentOVI: 58,
    currentVAI: 72,
    currentDTRI: 68,
    competitorQAI: 78,
    marketAverageQAI: 71,
    industryBenchmark: 85
  });

  const [results, setResults] = useState<AIEnhancedResults>({
    costSavings: 0,
    grossProfitIncrease: 0,
    additionalUnits: 0,
    additionalLeads: 0,
    totalOpportunity: 0,
    roi: 0,
    paybackPeriod: 0,
    aiImpact: 0,
    competitiveAdvantage: 0,
    visibilityGain: 0,
    trustImprovement: 0,
    authorityBoost: 0,
    qaiImprovement: 0,
    piqrReduction: 0,
    oviIncrease: 0,
    vaiIncrease: 0,
    dtriImprovement: 0,
    revenueAtRisk: 0,
    marketShareGain: 0,
    customerLifetimeValue: 0,
    brandEquityIncrease: 0
  });

  const [aiInsights, setAiInsights] = useState<AIInsights>({
    recommendations: [],
    risks: [],
    opportunities: [],
    nextSteps: [],
    competitiveAnalysis: [],
    marketOpportunities: []
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'ai-analysis' | 'competitive' | 'export'>('calculator');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Enhanced calculation with AI metrics integration
  const calculateAIOpportunity = async () => {
    const {
      monthlyUnits, averageGross, currentEfficiency, currentCosts, currentLeads,
      dealershipSize, marketType, aiAdoption,
      currentQAI, currentPIQR, currentOVI, currentVAI, currentDTRI,
      competitorQAI, marketAverageQAI, industryBenchmark
    } = inputs;
    
    // 1. Traditional efficiency calculations
    const efficiencyGain = (100 - currentEfficiency) / 100;
    const baseCostSavings = currentCosts * efficiencyGain * 0.3;
    const baseGrossProfitIncrease = monthlyUnits * averageGross * efficiencyGain * 0.2;
    const baseAdditionalUnits = Math.round(monthlyUnits * efficiencyGain * 0.15);
    const baseAdditionalLeads = Math.round(currentLeads * efficiencyGain * 0.25);
    
    // 2. AI Score-based multipliers
    const qaiGap = (industryBenchmark - currentQAI) / 100;
    const piqrRisk = currentPIQR / 100;
    const oviGap = (marketAverageQAI - currentOVI) / 100;
    const vaiGap = (industryBenchmark - currentVAI) / 100;
    const dtriGap = (industryBenchmark - currentDTRI) / 100;
    
    // 3. AI Impact calculations
    const aiVisibilityMultiplier = 1 + (qaiGap * 0.4 + oviGap * 0.3 + vaiGap * 0.3);
    const aiTrustMultiplier = 1 + (dtriGap * 0.5 + (1 - piqrRisk) * 0.5);
    const aiAuthorityMultiplier = 1 + (qaiGap * 0.6 + dtriGap * 0.4);
    
    // 4. Competitive advantage calculations
    const competitiveGap = (competitorQAI - currentQAI) / 100;
    const competitiveMultiplier = 1 + Math.max(0, competitiveGap * 0.8);
    
    // 5. Market opportunity calculations
    const marketGap = (marketAverageQAI - currentQAI) / 100;
    const marketMultiplier = 1 + Math.max(0, marketGap * 0.6);
    
    // 6. Size and market multipliers
    const sizeMultiplier = dealershipSize === 'large' ? 1.3 : dealershipSize === 'medium' ? 1.0 : 0.8;
    const marketTypeMultiplier = marketType === 'urban' ? 1.2 : marketType === 'suburban' ? 1.0 : 0.9;
    const aiAdoptionMultiplier = aiAdoption === 'high' ? 1.5 : aiAdoption === 'medium' ? 1.2 : 1.0;
    
    // 7. Combined multipliers
    const totalAIMultiplier = aiVisibilityMultiplier * aiTrustMultiplier * aiAuthorityMultiplier;
    const totalMarketMultiplier = competitiveMultiplier * marketMultiplier * sizeMultiplier * marketTypeMultiplier * aiAdoptionMultiplier;
    
    // 8. Enhanced opportunity calculations
    const aiEnhancedCostSavings = baseCostSavings * totalAIMultiplier;
    const aiEnhancedGrossProfit = baseGrossProfitIncrease * totalAIMultiplier;
    const aiEnhancedUnits = Math.round(baseAdditionalUnits * totalAIMultiplier);
    const aiEnhancedLeads = Math.round(baseAdditionalLeads * totalAIMultiplier);
    
    // 9. AI-specific financial impacts
    const revenueAtRisk = monthlyUnits * averageGross * piqrRisk * 0.3; // 30% of revenue at risk
    const marketShareGain = (monthlyUnits * averageGross * marketGap * 0.2); // 20% market share gain
    const customerLifetimeValue = (currentLeads * 0.15 * 2500 * 3); // 15% conversion, $2500 avg, 3 year LTV
    const brandEquityIncrease = (monthlyUnits * averageGross * aiAuthorityMultiplier * 0.1); // 10% brand equity
    
    // 10. Total opportunity with all multipliers
    const totalOpportunity = (
      aiEnhancedCostSavings + 
      aiEnhancedGrossProfit + 
      (aiEnhancedUnits * averageGross) +
      revenueAtRisk +
      marketShareGain +
      brandEquityIncrease
    ) * totalMarketMultiplier;
    
    // 11. ROI and payback calculations
    const roi = (totalOpportunity / 499) * 100;
    const paybackPeriod = 499 / (totalOpportunity / 12);
    
    // 12. AI impact metrics
    const aiImpact = (totalAIMultiplier - 1) * 100;
    const competitiveAdvantage = Math.min(competitiveGap * 200, 100);
    const visibilityGain = (qaiGap + oviGap + vaiGap) * 100 / 3;
    const trustImprovement = (dtriGap + (1 - piqrRisk)) * 100 / 2;
    const authorityBoost = (qaiGap + dtriGap) * 100 / 2;
    
    // 13. Score improvements
    const qaiImprovement = Math.min(qaiGap * 100, 25); // Max 25 point improvement
    const piqrReduction = Math.min(piqrRisk * 100, 20); // Max 20 point reduction
    const oviIncrease = Math.min(oviGap * 100, 20); // Max 20 point increase
    const vaiIncrease = Math.min(vaiGap * 100, 25); // Max 25 point increase
    const dtriImprovement = Math.min(dtriGap * 100, 20); // Max 20 point improvement

    setResults({
      costSavings: Math.round(aiEnhancedCostSavings),
      grossProfitIncrease: Math.round(aiEnhancedGrossProfit),
      additionalUnits: aiEnhancedUnits,
      additionalLeads: aiEnhancedLeads,
      totalOpportunity: Math.round(totalOpportunity),
      roi: Math.round(roi),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      aiImpact: Math.round(aiImpact),
      competitiveAdvantage: Math.round(competitiveAdvantage),
      visibilityGain: Math.round(visibilityGain),
      trustImprovement: Math.round(trustImprovement),
      authorityBoost: Math.round(authorityBoost),
      qaiImprovement: Math.round(qaiImprovement),
      piqrReduction: Math.round(piqrReduction),
      oviIncrease: Math.round(oviIncrease),
      vaiIncrease: Math.round(vaiIncrease),
      dtriImprovement: Math.round(dtriImprovement),
      revenueAtRisk: Math.round(revenueAtRisk),
      marketShareGain: Math.round(marketShareGain),
      customerLifetimeValue: Math.round(customerLifetimeValue),
      brandEquityIncrease: Math.round(brandEquityIncrease)
    });

    // Generate AI insights
    await generateAIInsights();
  };

  const generateAIInsights = async () => {
    const {
      currentQAI, currentPIQR, currentOVI, currentVAI, currentDTRI,
      competitorQAI, marketAverageQAI, industryBenchmark
    } = inputs;

    const insights: AIInsights = {
      recommendations: [
        `Optimize QAI score from ${currentQAI} to ${Math.min(currentQAI + results.qaiImprovement, 100)} for ${Math.round(results.qaiImprovement * 1000)}% authority boost`,
        `Reduce PIQR risk from ${currentPIQR}% to ${Math.max(currentPIQR - results.piqrReduction, 0)}% to protect ${Math.round(results.revenueAtRisk)} in revenue`,
        `Increase OVI from ${currentOVI} to ${Math.min(currentOVI + results.oviIncrease, 100)} to capture ${Math.round(results.marketShareGain)} in market share`,
        `Boost VAI from ${currentVAI} to ${Math.min(currentVAI + results.vaiIncrease, 100)} for ${Math.round(results.visibilityGain)}% visibility gain`,
        `Improve DTRI from ${currentDTRI} to ${Math.min(currentDTRI + results.dtriImprovement, 100)} for ${Math.round(results.trustImprovement)}% trust improvement`
      ],
      risks: [
        `Competitor QAI of ${competitorQAI} vs your ${currentQAI} creates ${Math.round((competitorQAI - currentQAI) * 1000)}% competitive disadvantage`,
        `PIQR risk of ${currentPIQR}% puts ${Math.round(results.revenueAtRisk)} in monthly revenue at risk`,
        `Market average QAI of ${marketAverageQAI} vs your ${currentQAI} means you're losing market share`,
        `Industry benchmark of ${industryBenchmark} shows significant improvement opportunity`,
        `Low AI adoption creates vulnerability to AI-native competitors`
      ],
      opportunities: [
        `QAI improvement to industry benchmark could unlock ${Math.round(results.authorityBoost * 1000)}% authority boost`,
        `PIQR reduction could protect ${Math.round(results.revenueAtRisk)} in monthly revenue`,
        `OVI increase could capture ${Math.round(results.marketShareGain)} in additional market share`,
        `VAI optimization could generate ${Math.round(results.visibilityGain * 1000)}% more visibility`,
        `DTRI improvement could increase trust by ${Math.round(results.trustImprovement)}%`
      ],
      nextSteps: [
        "Run comprehensive AI visibility audit to identify specific optimization opportunities",
        "Implement QAI optimization strategy focusing on authority and expertise signals",
        "Deploy PIQR risk mitigation measures to protect revenue",
        "Launch OVI enhancement campaign to capture market share",
        "Schedule monthly AI performance reviews to track improvements"
      ],
      competitiveAnalysis: [
        `Your QAI (${currentQAI}) vs Competitor (${competitorQAI}): ${competitorQAI > currentQAI ? 'Behind by ' + (competitorQAI - currentQAI) + ' points' : 'Ahead by ' + (currentQAI - competitorQAI) + ' points'}`,
        `Market Position: ${currentQAI > marketAverageQAI ? 'Above' : 'Below'} market average of ${marketAverageQAI}`,
        `Industry Benchmark Gap: ${industryBenchmark - currentQAI} points below industry standard`,
        `Competitive Advantage: ${results.competitiveAdvantage}% potential improvement`,
        `Market Opportunity: ${Math.round(results.marketShareGain)} in additional revenue potential`
      ],
      marketOpportunities: [
        `AI Overviews present ${Math.round(results.visibilityGain * 1000)}% visibility opportunity`,
        `Voice search optimization could capture ${Math.round(results.marketShareGain * 0.3)} in early adopter revenue`,
        `Local AI search dominance could increase market share by ${Math.round(results.marketShareGain * 0.2)}`,
        `Trust signal optimization could improve conversion by ${Math.round(results.trustImprovement)}%`,
        `Authority building could increase customer lifetime value by ${Math.round(results.customerLifetimeValue * 0.1)}`
      ]
    };

    setAiInsights(insights);
  };

  useEffect(() => {
    calculateAIOpportunity();
  }, [inputs]);

  const handleInputChange = (field: keyof AIEnhancedInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const exportToPDF = () => {
    console.log('Exporting AI-enhanced analysis to PDF...');
  };

  const exportToCSV = () => {
    console.log('Exporting AI data to CSV...');
  };

  const shareResults = () => {
    console.log('Sharing AI opportunity analysis...');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI-Enhanced Opportunity Calculator</h1>
                <p className="text-sm text-gray-500">Powered by QAI, PIQR, OVI, VAI & DTRI Analysis</p>
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
              { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
              { id: 'competitive', label: 'Competitive', icon: Target },
              { id: 'export', label: 'Export', icon: Download }
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
                  <span>Dealership & AI Metrics</span>
                </h2>
                
                <div className="space-y-6">
                  {/* Basic Metrics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Metrics</h3>
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
                  </div>

                  {/* AI Scores */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Current AI Scores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">QAI Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.currentQAI}
                          onChange={(e) => handleInputChange('currentQAI', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">PIQR Risk (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.currentPIQR}
                          onChange={(e) => handleInputChange('currentPIQR', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">OVI Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.currentOVI}
                          onChange={(e) => handleInputChange('currentOVI', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">VAI Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.currentVAI}
                          onChange={(e) => handleInputChange('currentVAI', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">DTRI Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.currentDTRI}
                          onChange={(e) => handleInputChange('currentDTRI', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Competitive Context */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Competitive Context</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Competitor QAI</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.competitorQAI}
                          onChange={(e) => handleInputChange('competitorQAI', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Market Average QAI</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.marketAverageQAI}
                          onChange={(e) => handleInputChange('marketAverageQAI', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Industry Benchmark</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.industryBenchmark}
                          onChange={(e) => handleInputChange('industryBenchmark', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>AI-Enhanced Opportunity Analysis</span>
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

                  {/* AI Impact Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">AI Impact</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        +{results.aiImpact}%
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Competitive Advantage</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {results.competitiveAdvantage}%
                      </div>
                    </div>
                  </div>

                  {/* Score Improvements */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Score Improvements</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">QAI Improvement</span>
                        <span className="font-semibold text-green-600">+{results.qaiImprovement}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">PIQR Reduction</span>
                        <span className="font-semibold text-red-600">-{results.piqrReduction}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">OVI Increase</span>
                        <span className="font-semibold text-blue-600">+{results.oviIncrease}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">VAI Increase</span>
                        <span className="font-semibold text-purple-600">+{results.vaiIncrease}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">DTRI Improvement</span>
                        <span className="font-semibold text-indigo-600">+{results.dtriImprovement}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Impact Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Financial Impact Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Revenue at Risk</span>
                        <span className="font-semibold">${results.revenueAtRisk.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Market Share Gain</span>
                        <span className="font-semibold">${results.marketShareGain.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Brand Equity Increase</span>
                        <span className="font-semibold">${results.brandEquityIncrease.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-analysis' && (
            <motion.div
              key="ai-analysis"
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

          {activeTab === 'competitive' && (
            <motion.div
              key="competitive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Competitive Analysis */}
              <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Competitive Analysis</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Competitive Analysis */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span>Competitive Position</span>
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.competitiveAnalysis.map((analysis, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{analysis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Market Opportunities */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      <span>Market Opportunities</span>
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.marketOpportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{opportunity}</span>
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
                      <h3 className="font-medium">AI Analysis Report</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive AI opportunity analysis with QAI, PIQR, OVI insights
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
                      <h3 className="font-medium">AI Metrics Data</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Raw AI scoring data for further analysis
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
                      <h3 className="font-medium">Share Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share your AI opportunity analysis with stakeholders
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
