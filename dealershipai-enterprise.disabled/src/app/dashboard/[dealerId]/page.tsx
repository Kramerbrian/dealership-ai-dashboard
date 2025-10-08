import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MetricCard from '@/components/dashboard/MetricCard'
import { Target, TrendingUp, Star, Users } from 'lucide-react'

interface DashboardPageProps {
  params: Promise<{
    dealerId: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { dealerId } = await params
  // In production, fetch this from session/auth
  const dealerInfo = {
    id: dealerId,
    name: 'Terry Reid Hyundai',
  }

  return (
    <DashboardLayout dealerName={dealerInfo.name} dealerId={dealerInfo.id}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {dealerInfo.name}
        </h1>
        <p className="text-slate-600">Here&apos;s how your dealership is performing today</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="AI Visibility Score"
          value={72}
          change={8}
          trend="up"
          subtitle="vs last week"
          icon={<Target className="w-6 h-6" />}
          color="emerald"
        />
        <MetricCard
          title="Review Health"
          value={4.6}
          change={0.3}
          trend="up"
          subtitle="128 total reviews"
          icon={<Star className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Local Rank"
          value="#3"
          trend="neutral"
          subtitle="in Naples, FL"
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
        />
        <MetricCard
          title="Monthly Leads"
          value={47}
          change={12}
          trend="up"
          subtitle="from AI channels"
          icon={<Users className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">AI Visibility Trend</h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            Chart placeholder - AI visibility over time
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Action Queue</h3>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
              <h4 className="font-semibold text-amber-900">Add FAQ Schema Markup</h4>
              <p className="text-sm text-amber-700">+12 visibility points</p>
            </div>
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <h4 className="font-semibold text-red-900">Respond to Recent Reviews</h4>
              <p className="text-sm text-red-700">3 reviews pending response</p>
            </div>
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h4 className="font-semibold text-blue-900">Update Business Hours</h4>
              <p className="text-sm text-blue-700">GMB hours don&apos;t match website</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Competitive Matrix</h3>
        <div className="space-y-3">
          {[
            { name: 'Naples Honda', score: 78, trend: 'up' },
            { name: 'Germain Toyota', score: 65, trend: 'neutral' },
            { name: 'Mazda of Naples', score: 58, trend: 'down' },
          ].map((competitor) => (
            <div key={competitor.name} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg flex items-center justify-center text-white font-semibold">
                    {competitor.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{competitor.name}</h4>
                    <p className="text-xs text-slate-500">Updated 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-600">
                    {competitor.score}
                  </span>
                  {competitor.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
