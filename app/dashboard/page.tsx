export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">DealershipAI Dashboard</h1>
              <p className="text-sm text-white/60">AI Visibility Analytics & Optimization</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-white/60">Current Tier</div>
                <div className="text-sm font-semibold text-white">Professional</div>
              </div>
              <button className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/40">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Revenue at Risk</h3>
              <p className="text-3xl font-bold text-red-400">$367K</p>
              <p className="text-sm text-white/60 mt-1">Estimated monthly exposure</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">AI Visibility</h3>
              <p className="text-3xl font-bold text-green-400">92%</p>
              <p className="text-sm text-white/60 mt-1">Composite score across AI platforms</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Monthly Leads</h3>
              <p className="text-3xl font-bold text-blue-400">245</p>
              <p className="text-sm text-white/60 mt-1">Generated from AI search</p>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Assistant</h3>
            <p className="text-white/80 mb-4">Ask me about your AI visibility metrics and optimization opportunities.</p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Ask about revenue at risk
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Analyze visibility trends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
