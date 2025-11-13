'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'

interface OCIData {
  tenant_id: string
  elasticity_usd_per_point: number
  oci_28d_usd: number
  sev1: number
  sev2: number
  sev3: number
  total_open: number
  computed_at: string
}

interface OCILiveMeterProps {
  tenantId: string
  refreshInterval?: number // in milliseconds
}

export default function OCILiveMeter({ tenantId, refreshInterval = 300000 }: OCILiveMeterProps) {
  const [data, setData] = useState<OCIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchOCIData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/oci/live?tenantId=${tenantId}`)
      const result = await response.json()
      
      if (result.ok) {
        setData(result.data)
        setLastRefresh(new Date())
      } else {
        setError(result.error || 'Failed to fetch OCI data')
      }
    } catch (err) {
      setError('Network error while fetching OCI data')
      console.error('OCI fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchOCIData()
  }

  const handleExport = () => {
    if (data) {
      const exportData = {
        tenantId,
        ociData: data,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oci-live-${tenantId}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  useEffect(() => {
    fetchOCIData()
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchOCIData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [tenantId, refreshInterval])

  const getRiskLevel = (ociAmount: number) => {
    if (ociAmount > 50000) return { level: 'critical', color: 'bg-red-500', text: 'Critical Risk' }
    if (ociAmount > 25000) return { level: 'high', color: 'bg-orange-500', text: 'High Risk' }
    if (ociAmount > 10000) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium Risk' }
    return { level: 'low', color: 'bg-green-500', text: 'Low Risk' }
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 3: return 'bg-red-100 text-red-800 border-red-200'
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200'
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading && !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            OCI Live Meter (28d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse bg-gray-100 rounded-xl" />
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
            OCI Live Meter (28d)
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

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            OCI Live Meter (28d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No OCI data available</div>
        </CardContent>
      </Card>
    )
  }

  const riskLevel = getRiskLevel(Number(data.oci_28d_usd))

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            OCI Live Meter (28d)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${riskLevel.color} text-white`}>
              {riskLevel.text}
            </Badge>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Export
            </Button>
          </div>
        </div>
        {lastRefresh && (
          <p className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main OCI Display */}
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Estimated $ at risk</div>
              <div className="text-4xl font-bold text-gray-900">
                ${Number(data.oci_28d_usd).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Elasticity: ${Number(data.elasticity_usd_per_point).toFixed(0)}/pt
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Based on {data.total_open} open violations
              </span>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Violation Severity</div>
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-lg border p-3 text-center ${getSeverityColor(1)}`}>
                <div className="text-xs font-medium mb-1">Sev 1</div>
                <div className="text-2xl font-bold">{data.sev1}</div>
                <div className="text-xs opacity-75">Low</div>
              </div>
              <div className={`rounded-lg border p-3 text-center ${getSeverityColor(2)}`}>
                <div className="text-xs font-medium mb-1">Sev 2</div>
                <div className="text-2xl font-bold">{data.sev2}</div>
                <div className="text-xs opacity-75">Medium</div>
              </div>
              <div className={`rounded-lg border p-3 text-center ${getSeverityColor(3)}`}>
                <div className="text-xs font-medium mb-1">Sev 3</div>
                <div className="text-2xl font-bold">{data.sev3}</div>
                <div className="text-xs opacity-75">High</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Action Required
              </div>
              <div className="text-xs text-gray-600">
                OCI is estimated from open violations × elasticity. Resolve top issues to reduce immediate $ risk.
                {data.sev3 > 0 && (
                  <span className="block mt-1 text-red-600 font-medium">
                    {data.sev3} critical violations need immediate attention.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
