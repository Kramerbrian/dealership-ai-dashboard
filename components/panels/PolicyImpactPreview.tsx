// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Shield } from 'lucide-react'

interface PolicyImpactPreviewProps {
  tenantId: string
}

interface PreviewResult {
  ok: boolean
  summary: {
    wouldBlock: number
    wouldUnblock: number
    sev: { s1: number; s2: number; s3: number }
    ociForecast_usd: number
    elasticity_usd_per_point: number
  }
  changesFromCurrent?: {
    blockChange: number
    ociChange: number
    severityChange: { s1: number; s2: number; s3: number }
  }
  context: {
    total_violations_28d: number
    current_severity_breakdown: { s1: number; s2: number; s3: number }
    avg_delta_price: number
    affected_vins: number
  }
  sample: Array<{
    id: string
    vin?: string
    rule: string
    severity: number
    sevCalc: number
    block: boolean
    delta_price?: number
    undisclosed_count?: number
  }>
  policy: any
  generated_at: string
}

const defaultPolicy = {
  offerIntegrity: {
    priceDelta: { sev1: 100, sev2: 250, sev3: 500 },
    undisclosedFeeCodes: ["UNDISCLOSED_FEE"],
    strikethroughThreshold: 0.2
  },
  gate: {
    blockOn: ["PRICE_DELTA.sev3", "UNDISCLOSED_FEE"],
    autoQuarantine: true,
    sev3Threshold: 5
  },
  staleness: {
    ttl: 24,
    autoDecay: true,
    archiveAfter: 90
  }
}

export default function PolicyImpactPreview({ tenantId }: PolicyImpactPreviewProps) {
  const [result, setResult] = useState<PreviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [policyJson, setPolicyJson] = useState<string>(() => 
    JSON.stringify(defaultPolicy, null, 2)
  )

  const runPreview = async () => {
    try {
      setLoading(true)
      setError(null)

      const draftPolicy = JSON.parse(policyJson)
      
      const response = await fetch('/api/policy/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, draftPolicy })
      })

      const data = await response.json()
      
      if (data.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Preview failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run preview')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 3: return 'bg-red-100 text-red-800 border-red-200'
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200'
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatChange = (change: number, isPositive: boolean = false) => {
    const sign = change > 0 ? '+' : ''
    const color = change > 0 ? (isPositive ? 'text-green-600' : 'text-red-600') : 
                  change < 0 ? (isPositive ? 'text-red-600' : 'text-green-600') : 'text-gray-600'
    return <span className={color}>{sign}{change}</span>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Policy Impact Preview
          </CardTitle>
          <Button 
            onClick={runPreview} 
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {loading ? 'Simulating...' : 'Simulate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Policy Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policy Configuration (JSON)
          </label>
          <textarea
            className="w-full h-40 font-mono text-sm rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={policyJson}
            onChange={(e) => setPolicyJson(e.target.value)}
            placeholder="Enter policy configuration..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-gray-500 text-xs mb-1">Would Block</div>
                <div className="text-2xl font-bold text-red-600">{(result as any).summary.wouldBlock}</div>
                {(result as any).changesFromCurrent && (
                  <div className="text-xs mt-1">
                    {formatChange((result as any).changesFromCurrent.blockChange)}
                  </div>
                )}
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="text-gray-500 text-xs mb-1">Severity 3/2/1</div>
                <div className="text-lg font-semibold">
                  {(result as any).summary.sev.s3}/{(result as any).summary.sev.s2}/{(result as any).summary.sev.s1}
                </div>
                {(result as any).changesFromCurrent && (
                  <div className="text-xs mt-1 space-x-1">
                    {formatChange((result as any).changesFromCurrent.severityChange.s3)}/
                    {formatChange((result as any).changesFromCurrent.severityChange.s2)}/
                    {formatChange((result as any).changesFromCurrent.severityChange.s1)}
                  </div>
                )}
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="text-gray-500 text-xs mb-1">Elasticity $/pt</div>
                <div className="text-xl font-semibold">
                  ${(result as any).summary.elasticity_usd_per_point}
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="text-gray-500 text-xs mb-1">OCI Forecast (28d)</div>
                <div className="text-xl font-semibold">
                  ${(result as any).summary.ociForecast_usd.toLocaleString()}
                </div>
                {(result as any).changesFromCurrent && (
                  <div className="text-xs mt-1">
                    {formatChange((result as any).changesFromCurrent.ociChange, true)}
                  </div>
                )}
              </div>
            </div>

            {/* Context Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(result as any).context.total_violations_28d}
                </div>
                <div className="text-xs text-gray-600">Total Violations (28d)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(result as any).context.affected_vins}
                </div>
                <div className="text-xs text-gray-600">Affected VINs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round((result as any).context.avg_delta_price).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Avg Price Delta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(result as any).context.current_severity_breakdown.s3 + 
                   (result as any).context.current_severity_breakdown.s2 + 
                   (result as any).context.current_severity_breakdown.s1}
                </div>
                <div className="text-xs text-gray-600">Current Blocked</div>
              </div>
            </div>

            {/* Sample Violations */}
            {(result as any).sample.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Sample Violations (showing first 10)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2">VIN</th>
                        <th className="pb-2">Rule</th>
                        <th className="pb-2">Current</th>
                        <th className="pb-2">New</th>
                        <th className="pb-2">Action</th>
                        <th className="pb-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result as any).sample.slice(0, 10).map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 font-mono text-xs">
                            {item.vin ? item.vin.slice(-8) : '—'}
                          </td>
                          <td className="py-2">
                            <Badge variant="outline" className="text-xs">
                              {item.rule}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Badge className={getSeverityColor(item.severity)}>
                              {item.severity}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Badge className={getSeverityColor(item.sevCalc)}>
                              {item.sevCalc}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Badge className={item.block ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {item.block ? 'Block' : 'Allow'}
                            </Badge>
                          </td>
                          <td className="py-2 text-xs">
                            {item.delta_price ? `$${Math.abs(item.delta_price).toLocaleString()}` : 
                             item.undisclosed_count ? `${item.undisclosed_count} fees` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Generated At */}
            <div className="text-xs text-gray-500 text-center">
              Generated at: {new Date((result as any).generated_at).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
