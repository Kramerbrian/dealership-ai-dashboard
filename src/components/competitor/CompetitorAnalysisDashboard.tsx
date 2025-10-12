'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Search, 
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Users,
  Globe,
  Zap,
  Star,
  Activity
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  brand: string;
  aiVisibilityScore: number;
  marketShare: number;
  monthlyUnits: number;
  avgGrossProfit: number;
  lastUpdated: string;
  trends: {
    aiVisibility: 'up' | 'down' | 'stable';
    marketShare: 'up' | 'down' | 'stable';
    units: 'up' | 'down' | 'stable';
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface CompetitorMetrics {
  totalCompetitors: number;
  avgAiVisibility: number;
  marketLeader: string;
  topPerformer: string;
  biggestOpportunity: string;
  competitiveGap: number;
  marketConcentration: number;
}

interface CompetitorAnalysisDashboardProps {
  tenantId?: string;
  userRole?: 'super_admin' | 'enterprise_admin' | 'dealership_admin' | 'user';
}

export default function CompetitorAnalysisDashboard({ 
  tenantId, 
  userRole = 'user' 
}: CompetitorAnalysisDashboardProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [metrics, setMetrics] = useState<CompetitorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Mock data for demonstration
  const mockCompetitors: Competitor[] = [
    {
      id: 'comp-1',
      name: 'Premier Auto Group',
      domain: 'premierauto.com',
      city: 'Austin',
      state: 'TX',
      brand: 'Toyota',
      aiVisibilityScore: 87,
      marketShare: 23.5,
      monthlyUnits: 145,
      avgGrossProfit: 3200,
      lastUpdated: new Date().toISOString(),
      trends: {
        aiVisibility: 'up',
        marketShare: 'up',
        units: 'stable'
      },
      strengths: ['Strong local SEO', 'Excellent customer reviews', 'AI-optimized content'],
      weaknesses: ['Limited social media presence', 'Slow website loading'],
      opportunities: ['Voice search optimization', 'Local AI assistants']
    },
    {
      id: 'comp-2',
      name: 'Metro Motors',
      domain: 'metromotors.com',
      city: 'Austin',
      state: 'TX',
      brand: 'Honda',
      aiVisibilityScore: 72,
      marketShare: 18.2,
      monthlyUnits: 98,
      avgGrossProfit: 2800,
      lastUpdated: new Date().toISOString(),
      trends: {
        aiVisibility: 'down',
        marketShare: 'stable',
        units: 'down'
      },
      strengths: ['Strong brand recognition', 'Good financing options'],
      weaknesses: ['Poor AI visibility', 'Outdated website', 'Limited digital marketing'],
      opportunities: ['AI content strategy', 'Website modernization', 'Local SEO improvement']
    },
    {
      id: 'comp-3',
      name: 'Elite Car Center',
      domain: 'elitecarcenter.com',
      city: 'Austin',
      state: 'TX',
      brand: 'BMW',
      aiVisibilityScore: 91,
      marketShare: 15.8,
      monthlyUnits: 67,
      avgGrossProfit: 8500,
      lastUpdated: new Date().toISOString(),
      trends: {
        aiVisibility: 'up',
        marketShare: 'up',
        units: 'up'
      },
      strengths: ['Premium AI positioning', 'Excellent digital experience', 'Strong social proof'],
      weaknesses: ['High price point', 'Limited inventory'],
      opportunities: ['Luxury AI assistants', 'Premium content marketing']
    },
    {
      id: 'comp-4',
      name: 'Family Auto Sales',
      domain: 'familyautosales.com',
      city: 'Austin',
      state: 'TX',
      brand: 'Ford',
      aiVisibilityScore: 65,
      marketShare: 12.1,
      monthlyUnits: 78,
      avgGrossProfit: 2400,
      lastUpdated: new Date().toISOString(),
      trends: {
        aiVisibility: 'stable',
        marketShare: 'down',
        units: 'down'
      },
      strengths: ['Family-friendly approach', 'Good service department'],
      weaknesses: ['Weak digital presence', 'Poor AI optimization', 'Limited online reviews'],
      opportunities: ['Digital transformation', 'AI content creation', 'Online reputation management']
    }
  ];

  const mockMetrics: CompetitorMetrics = {
    totalCompetitors: 4,
    avgAiVisibility: 78.75,
    marketLeader: 'Premier Auto Group',
    topPerformer: 'Elite Car Center',
    biggestOpportunity: 'Voice search optimization',
    competitiveGap: 12.3,
    marketConcentration: 69.6
  };

  // Fetch competitor data
  const fetchCompetitorData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCompetitors(mockCompetitors);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching competitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitorData();
  }, [tenantId]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || competitor.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const exportData = () => {
    const csvContent = [
      ['Name', 'Domain', 'Brand', 'AI Visibility Score', 'Market Share', 'Monthly Units', 'Avg Gross Profit'],
      ...filteredCompetitors.map(competitor => [
        competitor.name,
        competitor.domain,
        competitor.brand,
        competitor.aiVisibilityScore,
        competitor.marketShare,
        competitor.monthlyUnits,
        competitor.avgGrossProfit
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitor-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading competitor analysis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Competitor Analysis Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor competitor performance and identify market opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCompetitorData} 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button 
            onClick={exportData} 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Competitors</p>
                <p className="text-2xl font-bold">{metrics.totalCompetitors}</p>
                <p className="text-xs text-gray-500">In your market</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg AI Visibility</p>
                <p className="text-2xl font-bold">{metrics.avgAiVisibility}%</p>
                <p className="text-xs text-gray-500">Market average</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Leader</p>
                <p className="text-lg font-bold">{metrics.marketLeader}</p>
                <p className="text-xs text-gray-500">By market share</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-lg font-bold">{metrics.topPerformer}</p>
                <p className="text-xs text-gray-500">AI visibility</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search competitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Brands</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="BMW">BMW</option>
              <option value="Ford">Ford</option>
            </select>
          </div>
        </div>
      </div>

      {/* Competitors Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Competitor Analysis</h3>
          <p className="text-sm text-gray-600">{filteredCompetitors.length} competitors found</p>
        </div>
        
        <div className="space-y-4">
          {filteredCompetitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No competitors found for the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCompetitors.map((competitor) => (
                <div
                  key={competitor.id}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{competitor.name}</h4>
                      <p className="text-sm text-gray-600">{competitor.domain} • {competitor.brand}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">AI Visibility</p>
                        <p className={`text-2xl font-bold px-3 py-1 rounded-full ${getScoreColor(competitor.aiVisibilityScore)}`}>
                          {competitor.aiVisibilityScore}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Market Share</p>
                        <p className="text-2xl font-bold">{competitor.marketShare}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Monthly Units</p>
                        <p className="text-2xl font-bold">{competitor.monthlyUnits}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Trends */}
                    <div>
                      <h5 className="font-medium mb-2">Trends</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AI Visibility</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(competitor.trends.aiVisibility)}
                            <span className={`text-sm ${getTrendColor(competitor.trends.aiVisibility)}`}>
                              {competitor.trends.aiVisibility}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Market Share</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(competitor.trends.marketShare)}
                            <span className={`text-sm ${getTrendColor(competitor.trends.marketShare)}`}>
                              {competitor.trends.marketShare}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Units</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(competitor.trends.units)}
                            <span className={`text-sm ${getTrendColor(competitor.trends.units)}`}>
                              {competitor.trends.units}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Strengths
                      </h5>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-600">• {strength}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        Opportunities
                      </h5>
                      <ul className="space-y-1">
                        {competitor.opportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-gray-600">• {opportunity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
