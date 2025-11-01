'use client'
import { ReactNode } from 'react'
import { 
  Search, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  FileText, 
  DollarSign,
  Info
} from 'lucide-react'

interface KPITileProps {
  title: string
  value: string | number
  trend?: number
  status: 'excellent' | 'good' | 'needsWork' | 'critical'
  icon: ReactNode
  tooltip: string
  onClick?: () => void
}

function KPITile({ title, value, trend, status, icon, tooltip, onClick }: KPITileProps) {
  const statusColors = {
    excellent: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    good: 'border-blue-200 bg-blue-50 text-blue-800',
    needsWork: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    critical: 'border-red-200 bg-red-50 text-red-800'
  }

  const trendColor = trend && trend > 0 ? 'text-emerald-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-500'

  return (
    <div 
      className={`glass-card p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 ${statusColors[status]}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <div className="relative group">
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute z-10 left-0 top-6 w-64 text-xs bg-slate-900 text-white p-3 rounded-xl shadow-lg">
                {tooltip}
              </div>
            </div>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`text-sm font-medium ${trendColor}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-2">
        {value}
      </div>
      
      <div className="text-xs opacity-75">
        {status === 'excellent' && 'Excellent performance'}
        {status === 'good' && 'Good performance'}
        {status === 'needsWork' && 'Needs improvement'}
        {status === 'critical' && 'Requires attention'}
      </div>
    </div>
  )
}

interface SimplifiedKPITilesProps {
  data: {
    searchVisibility: number
    performanceScore: number
    reputationScore: number
    offerMatchScore: number
    listingAccuracy: number
    ociUSD: number
  }
  onTileClick?: (tile: string) => void
}

export default function SimplifiedKPITiles({ data, onTileClick }: SimplifiedKPITilesProps) {
  const getStatus = (score: number): 'excellent' | 'good' | 'needsWork' | 'critical' => {
    if (score >= 80) return 'excellent'
    if (score >= 65) return 'good'
    if (score >= 50) return 'needsWork'
    return 'critical'
  }

  const formatOCI = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toFixed(0)}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KPITile
        title="Search & AI Visibility"
        value={`${data.searchVisibility}%`}
        trend={5.2}
        status={getStatus(data.searchVisibility)}
        icon={<Search className="w-6 h-6" />}
        tooltip="How easy it is for customers and AI agents to find you online. Combines technical SEO performance with AI platform presence across ChatGPT, Gemini, and Perplexity."
        onClick={() => onTileClick?.('search-visibility')}
      />

      <KPITile
        title="Performance Score"
        value={`${data.performanceScore}%`}
        trend={2.1}
        status={getStatus(data.performanceScore)}
        icon={<TrendingUp className="w-6 h-6" />}
        tooltip="Your overall digital condition across search, trust, and accuracy. Weighted by E-E-A-T factors (Experience, Expertise, Authoritativeness, Trustworthiness) for maximum impact."
        onClick={() => onTileClick?.('performance')}
      />

      <KPITile
        title="Reputation Score"
        value={`${data.reputationScore}%`}
        trend={-1.3}
        status={getStatus(data.reputationScore)}
        icon={<Star className="w-6 h-6" />}
        tooltip="How much people trust your dealership based on reviews. Includes volume, rating quality, response rate, and sentiment analysis from Google, Yelp, and DealerRater."
        onClick={() => onTileClick?.('reputation')}
      />

      <KPITile
        title="Offer Match Score"
        value={`${data.offerMatchScore}%`}
        trend={3.7}
        status={getStatus(data.offerMatchScore)}
        icon={<CheckCircle className="w-6 h-6" />}
        tooltip="Whether your online prices match real-world appraisals. Tracks consistency between advertised prices, VIN data, and actual dealer pricing to prevent customer confusion."
        onClick={() => onTileClick?.('offer-match')}
      />

      <KPITile
        title="Listing Accuracy"
        value={`${data.listingAccuracy}%`}
        trend={1.8}
        status={getStatus(data.listingAccuracy)}
        icon={<FileText className="w-6 h-6" />}
        tooltip="Checks photos, descriptions, and VIN data compliance. Ensures your vehicle listings meet quality standards with proper photos, accurate descriptions, and complete vehicle information."
        onClick={() => onTileClick?.('listing-accuracy')}
      />

      <KPITile
        title="OCI – Opportunity Cost of Inaction"
        value={formatOCI(data.ociUSD)}
        trend={-8.2}
        status={data.ociUSD < 10000 ? 'excellent' : data.ociUSD < 25000 ? 'good' : data.ociUSD < 50000 ? 'needsWork' : 'critical'}
        icon={<DollarSign className="w-6 h-6" />}
        tooltip="Estimated revenue loss from unoptimized visibility or slow response. Calculated from conversion gaps, missed opportunities, and competitive disadvantages."
        onClick={() => onTileClick?.('oci')}
      />
    </div>
  )
}
