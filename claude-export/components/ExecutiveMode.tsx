'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';

interface ExecutiveData {
  forecast: Array<{
    month: string;
    dtri: number;
    revenue: number;
    valuation: number;
    confidence: number;
  }>;
  currentMetrics: {
    dtri: number;
    revenue: number;
    valuation: number;
    marketShare: number;
  };
  riskFactors: Array<{
    factor: string;
    impact: number;
    probability: number;
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    potential: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
}

export default function ExecutiveMode() {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData({
        forecast: [
          { month: 'Jan', dtri: 78, revenue: 125000, valuation: 2850000, confidence: 0.92 },
          { month: 'Feb', dtri: 82, revenue: 135000, valuation: 2950000, confidence: 0.89 },
          { month: 'Mar', dtri: 85, revenue: 145000, valuation: 3100000, confidence: 0.87 },
          { month: 'Apr', dtri: 88, revenue: 155000, valuation: 3250000, confidence: 0.85 },
          { month: 'May', dtri: 91, revenue: 165000, valuation: 3400000, confidence: 0.83 },
          { month: 'Jun', dtri: 94, revenue: 175000, valuation: 3550000, confidence: 0.81 },
          { month: 'Jul', dtri: 96, revenue: 185000, valuation: 3700000, confidence: 0.79 },
          { month: 'Aug', dtri: 98, revenue: 195000, valuation: 3850000, confidence: 0.77 },
          { month: 'Sep', dtri: 100, revenue: 205000, valuation: 4000000, confidence: 0.75 },
          { month: 'Oct', dtri: 102, revenue: 215000, valuation: 4150000, confidence: 0.73 },
          { month: 'Nov', dtri: 104, revenue: 225000, valuation: 4300000, confidence: 0.71 },
          { month: 'Dec', dtri: 106, revenue: 235000, valuation: 4450000, confidence: 0.69 }
        ],
        currentMetrics: {
          dtri: 78,
          revenue: 125000,
          valuation: 2850000,
          marketShare: 12.5
        },
        riskFactors: [
          { factor: 'Competitor AI Adoption', impact: 0.8, probability: 0.6, mitigation: 'Accelerate AI initiatives' },
          { factor: 'Economic Downturn', impact: 0.9, probability: 0.3, mitigation: 'Diversify revenue streams' },
          { factor: 'Regulatory Changes', impact: 0.7, probability: 0.4, mitigation: 'Compliance monitoring' },
          { factor: 'Technology Disruption', impact: 0.8, probability: 0.5, mitigation: 'Innovation investment' }
        ],
        opportunities: [
          { opportunity: 'AI-Powered Customer Service', potential: 50000, effort: 'medium', timeline: '3 months' },
          { opportunity: 'Predictive Analytics', potential: 75000, effort: 'high', timeline: '6 months' },
          { opportunity: 'Automated Marketing', potential: 30000, effort: 'low', timeline: '2 months' },
          { opportunity: 'Data Monetization', potential: 100000, effort: 'high', timeline: '9 months' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentValuation = data.currentMetrics.valuation;
  const projectedValuation = data.forecast[data.forecast.length - 1].valuation;
  const valuationIncrease = projectedValuation - currentValuation;
  const valuationIncreasePercent = (valuationIncrease / currentValuation) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Executive Dashboard</h1>
          <p className="text-slate-400">12-Month Forecast & Valuation Analysis</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">{data.currentMetrics.dtri}</div>
            <div className="text-sm text-slate-400 mb-1">Current DTRI</div>
            <div className="text-xs text-green-400">+{data.forecast[data.forecast.length - 1].dtri - data.currentMetrics.dtri} projected</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">${(data.currentMetrics.revenue / 1000).toFixed(0)}K</div>
            <div className="text-sm text-slate-400 mb-1">Monthly Revenue</div>
            <div className="text-xs text-green-400">+${((data.forecast[data.forecast.length - 1].revenue - data.currentMetrics.revenue) / 1000).toFixed(0)}K projected</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">${(currentValuation / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-slate-400 mb-1">Current Valuation</div>
            <div className="text-xs text-green-400">+{valuationIncreasePercent.toFixed(1)}% projected</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-orange-400 mb-2">{data.currentMetrics.marketShare}%</div>
            <div className="text-sm text-slate-400 mb-1">Market Share</div>
            <div className="text-xs text-slate-500">Regional</div>
          </div>
        </div>

        {/* 12-Month Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* DTRI & Revenue Forecast */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">12-Month Forecast</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.forecast}>
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'dtri' ? value : `$${(value / 1000).toFixed(0)}K`,
                      name === 'dtri' ? 'DTRI' : 'Revenue'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dtri" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Valuation Forecast */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Valuation Forecast</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.forecast}>
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`$${(value / 1000000).toFixed(1)}M`, 'Valuation']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valuation" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-lg font-semibold text-green-400">
                +${(valuationIncrease / 1000000).toFixed(1)}M Valuation Increase
              </div>
              <div className="text-sm text-green-300">
                {valuationIncreasePercent.toFixed(1)}% projected growth over 12 months
              </div>
            </div>
          </div>
        </div>

        {/* Risk & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Factors */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Factors</h2>
            <div className="space-y-4">
              {data.riskFactors.map((risk, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{risk.factor}</div>
                    <div className="text-sm text-slate-400">
                      Impact: {(risk.impact * 100).toFixed(0)}% | Prob: {(risk.probability * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">{risk.mitigation}</div>
                  <div className="mt-2 flex gap-2">
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${risk.impact * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${risk.probability * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Growth Opportunities</h2>
            <div className="space-y-4">
              {data.opportunities.map((opp, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{opp.opportunity}</div>
                    <div className="text-sm text-green-400">
                      +${(opp.potential / 1000).toFixed(0)}K potential
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 mb-2">Timeline: {opp.timeline}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Effort:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      opp.effort === 'low' ? 'bg-green-900 text-green-300' :
                      opp.effort === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {opp.effort}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">56%</div>
              <div className="text-sm text-slate-400">DTRI Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">88%</div>
              <div className="text-sm text-slate-400">Revenue Growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">56%</div>
              <div className="text-sm text-slate-400">Valuation Increase</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-300">
            Based on current trends and AI optimization initiatives, the dealership is projected to achieve 
            significant growth across all key metrics. The DTRI-MAXIMUS system is driving measurable improvements 
            in AI visibility and customer acquisition, resulting in substantial valuation increases.
          </div>
        </div>
      </div>
    </div>
  );
}
