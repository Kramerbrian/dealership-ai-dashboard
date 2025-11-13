import React from 'react'
import { MetricCard } from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react'

export function ExecutiveSummary() {
  return (
    <div className="space-y-6">
      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Overall AI Visibility Score"
          value="87"
          change={{ value: 5, direction: 'up' }}
          status="excellent"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Market Position"
          value="#2 of 8"
          change={{ value: 1, direction: 'up' }}
          status="good"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          label="Monthly Opportunity"
          value="$3,200"
          change={{ value: 400, direction: 'up' }}
          status="excellent"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Competitors"
          value="7"
          change={{ value: 0, direction: 'neutral' }}
          status="good"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* 5 Pillars Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>5 Pillars Deep Dive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">90</div>
              <div className="text-sm text-gray-600">AI Visibility</div>
              <div className="text-xs text-green-600">+3 this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">85</div>
              <div className="text-sm text-gray-600">Zero-Click Shield</div>
              <div className="text-xs text-blue-600">+2 this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">78</div>
              <div className="text-sm text-gray-600">UGC Health</div>
              <div className="text-xs text-yellow-600">+1 this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">92</div>
              <div className="text-sm text-gray-600">Geo Trust</div>
              <div className="text-xs text-purple-600">+4 this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">88</div>
              <div className="text-sm text-gray-600">SGP Integrity</div>
              <div className="text-xs text-indigo-600">+2 this month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Trust Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Business Profile</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Optimized</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Schema Markup</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Complete</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Review Response Rate</span>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Needs Attention</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Critical Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">Competitor Surge Detected</div>
                <div className="text-sm text-red-600">Honda of Naples jumped 12 points in AI visibility</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Review Response Needed</div>
                <div className="text-sm text-yellow-600">3 new reviews waiting for response (24+ hours)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 font-bold">1</span>
                </div>
                <span className="font-medium">Honda of Naples</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">92</div>
                <div className="text-xs text-gray-500">+5 gap</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-bold">2</span>
                </div>
                <span className="font-medium">Your Dealership</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">87</div>
                <div className="text-xs text-gray-500">Your score</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-800 font-bold">3</span>
                </div>
                <span className="font-medium">Toyota of Naples</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-600">78</div>
                <div className="text-xs text-gray-500">-9 gap</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
