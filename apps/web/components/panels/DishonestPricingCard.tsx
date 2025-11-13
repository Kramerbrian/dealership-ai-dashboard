'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, RefreshCw, Filter } from 'lucide-react'

interface AuditRecord {
  id: string
  vin: string | null
  vdp_url: string | null
  engine: string
  advertised_price: number | null
  engine_price: number | null
  otd_price_engine: number | null
  delta_price: number | null
  severity: number
  rule: string
  status: string
  created_at: string
  updated_at: string
}

interface DishonestPricingCardProps {
  tenantId: string
  limit?: number
  status?: 'open' | 'resolved' | 'all'
}

export default function DishonestPricingCard({ 
  tenantId, 
  limit = 50, 
  status = 'open' 
}: DishonestPricingCardProps) {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState(status)

  const fetchAudits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        tenantId,
        limit: limit.toString(),
        status: filterStatus
      })
      
      const response = await fetch(`/api/policy/offer-audit?${params}`)
      const result = await response.json()
      
      if (result.ok) {
        setAudits(result.audits || [])
      } else {
        setError(result.error || 'Failed to fetch audit data')
      }
    } catch (err) {
      setError('Network error while fetching audit data')
      console.error('Audit fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudits()
  }, [tenantId, limit, filterStatus])

  const getSeverityBadge = (severity: number) => {
    switch (severity) {
      case 3:
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
      case 2:
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
    }
  }

  const getRuleBadge = (rule: string) => {
    const ruleColors = {
      'PRICE_DELTA': 'bg-blue-100 text-blue-800 border-blue-200',
      'UNDISCLOSED_FEE': 'bg-purple-100 text-purple-800 border-purple-200',
      'STRIKETHROUGH_ABUSE': 'bg-red-100 text-red-800 border-red-200',
      'PRICE_MINOR': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <Badge className={ruleColors[rule as keyof typeof ruleColors] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {rule.replace('_', ' ')}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Open</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>
      case 'false_positive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">False Positive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return '—'
    return `$${price.toLocaleString()}`
  }

  const formatDelta = (delta: number | null) => {
    if (delta === null) return '—'
    const formatted = `$${Math.abs(delta).toLocaleString()}`
    return delta > 0 ? `+${formatted}` : `-${formatted}`
  }

  const handleVDPClick = (vdpUrl: string | null) => {
    if (vdpUrl) {
      window.open(vdpUrl, '_blank')
    }
  }

  const handleRefresh = () => {
    fetchAudits()
  }

  const handleStatusFilter = (newStatus: string) => {
    setFilterStatus(newStatus as 'open' | 'resolved' | 'all')
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Offer Integrity • Pricing & Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Offer Integrity • Pricing & Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm mb-4">{error}</div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Offer Integrity • Pricing & Fees
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex gap-1">
            {['all', 'open', 'resolved'].map((statusOption) => (
              <Button
                key={statusOption}
                onClick={() => handleStatusFilter(statusOption)}
                variant={filterStatus === statusOption ? 'default' : 'outline'}
                size="sm"
                className="text-xs capitalize"
              >
                {statusOption}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {audits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pricing violations found</p>
            <p className="text-sm">All offers appear to be compliant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {audits.filter(a => a.severity === 3).length}
                </div>
                <div className="text-xs text-gray-600">High Severity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {audits.filter(a => a.severity === 2).length}
                </div>
                <div className="text-xs text-gray-600">Medium Severity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {audits.filter(a => a.severity === 1).length}
                </div>
                <div className="text-xs text-gray-600">Low Severity</div>
              </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">VIN</th>
                    <th className="pb-2">Engine</th>
                    <th className="pb-2">Rule</th>
                    <th className="pb-2">Δ Price</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr key={audit.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs">
                        {audit.vin ? audit.vin.slice(-8) : '—'}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs">
                          {audit.engine}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {getRuleBadge(audit.rule)}
                      </td>
                      <td className="py-3 font-mono">
                        {formatDelta(audit.delta_price)}
                      </td>
                      <td className="py-3">
                        {getSeverityBadge(audit.severity)}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(audit.status)}
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {audit.vdp_url && (
                          <Button
                            onClick={() => handleVDPClick(audit.vdp_url)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>
                Flagged by rule: PRICE_DELTA / UNDISCLOSED_FEE / STRIKETHROUGH_ABUSE.
                {audits.length >= limit && ` Showing latest ${limit} violations.`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
