'use client'
import { TrendingDown, AlertTriangle, Target, DollarSign } from 'lucide-react'

export default function AiOverviewImpact() {
  // Mock data based on the research findings
  const impactData = {
    aiOverviewPresence: 27.4, // % of queries with AI Overviews
    trafficSiphoned: 34.5, // % CTR loss when AI Overviews present
    revenueAtRisk: 28750, // Monthly $ impact
    competitorAdvantage: 12.3, // % more visible than competitors
    zeroClickQueries: 156, // Queries where dealer doesn't appear
    citationRate: 8.2 // % of AI answers that cite dealer
  }

  const getImpactLevel = (percentage: number) => {
    if (percentage >= 30) return { level: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' }
    if (percentage >= 20) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' }
    if (percentage >= 10) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' }
  }

  const trafficImpact = getImpactLevel(impactData.trafficSiphoned)

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 backdrop-blur-lg">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="text-xl font-semibold text-white">AI Overview Impact</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${trafficImpact.bg} ${trafficImpact.color}`}>
          {trafficImpact.level} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Traffic Siphon */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-slate-300">Traffic Siphon</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {impactData.trafficSiphoned}%
          </div>
          <p className="text-xs text-slate-400">
            CTR loss when AI Overviews appear in search results
          </p>
        </div>

        {/* Revenue at Risk */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-slate-300">Revenue at Risk</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">
            ${impactData.revenueAtRisk.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">
            Monthly revenue lost to AI Overviews
          </p>
        </div>

        {/* AI Overview Presence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-slate-300">AI Overview Presence</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {impactData.aiOverviewPresence}%
          </div>
          <p className="text-xs text-slate-400">
            Of queries show AI-generated answers
          </p>
        </div>

        {/* Citation Rate */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Citation Rate</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {impactData.citationRate}%
          </div>
          <p className="text-xs text-slate-400">
            Of AI answers cite your dealership
          </p>
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <h4 className="text-sm font-semibold text-white mb-3">Immediate Actions</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            <span>Implement structured data for vehicles and reviews</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            <span>Create FAQ content targeting common queries</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            <span>Optimize entity markup for AI understanding</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span>Increase review response rate to 90%+</span>
          </div>
        </div>
      </div>

      {/* Research Context */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Research Context:</strong> AI Overviews appear in 18% of global searches (30% in US), 
          causing 34.5% CTR reduction. News publishers report up to 80% traffic drops. 
          Dealerships must optimize for AI search to prevent traffic siphon.
        </p>
      </div>
    </div>
  )
}
