export const dynamic = 'force-dynamic';

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">dAI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DealershipAI</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/dash" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/intelligence" className="text-blue-600 font-medium">Intelligence</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Intelligence Center</h1>
          <p className="mt-2 text-gray-600">
            Advanced AI analytics, competitor insights, and strategic recommendations.
          </p>
        </div>

        {/* Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">AI Insights</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Deep analysis of your AI visibility across all major platforms.
            </p>
            <div className="text-2xl font-bold text-blue-600">94.2%</div>
            <div className="text-sm text-gray-500">Overall AI Score</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Competitor Analysis</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Track how you compare against local and national competitors.
            </p>
            <div className="text-2xl font-bold text-green-600">#3</div>
            <div className="text-sm text-gray-500">Market Position</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Predictive Analytics</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Forecast future performance and identify growth opportunities.
            </p>
            <div className="text-2xl font-bold text-purple-600">+23%</div>
            <div className="text-sm text-gray-500">Projected Growth</div>
          </div>

          {/* AI Answer Intelligence Card - Static Version */}
          <div className="rounded-2xl p-5 bg-white/70 backdrop-blur shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-baseline justify-between">
              <h3 className="text-zinc-900 font-semibold">AI Answer Intel (30d)</h3>
              <span className="text-xs text-zinc-500">22 probes</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl p-3 bg-white shadow-xs border border-zinc-100">
                <div className="text-xs text-zinc-500">Citation Share</div>
                <div className="text-lg font-semibold text-zinc-900">62.5%</div>
              </div>
              <div className="rounded-xl p-3 bg-white shadow-xs border border-zinc-100">
                <div className="text-xs text-zinc-500">Zero-Click Rate</div>
                <div className="text-lg font-semibold text-zinc-900">16.7%</div>
              </div>
              <div className="rounded-xl p-3 bg-white shadow-xs border border-zinc-100">
                <div className="text-xs text-zinc-500">Engines Seen</div>
                <div className="text-lg font-semibold text-zinc-900">5</div>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-zinc-100">
              <li className="py-2 flex items-center justify-between">
                <span className="text-sm text-zinc-700 capitalize">chatgpt</span>
                <span className="text-sm text-zinc-900">4/3 cited • avg pos 2.5</span>
              </li>
              <li className="py-2 flex items-center justify-between">
                <span className="text-sm text-zinc-700 capitalize">perplexity</span>
                <span className="text-sm text-zinc-900">4/2 cited • avg pos 2.8</span>
              </li>
              <li className="py-2 flex items-center justify-between">
                <span className="text-sm text-zinc-700 capitalize">gemini</span>
                <span className="text-sm text-zinc-900">3/2 cited • avg pos 2.3</span>
              </li>
              <li className="py-2 flex items-center justify-between">
                <span className="text-sm text-zinc-700 capitalize">claude</span>
                <span className="text-sm text-zinc-900">1/1 cited • avg pos 2.0</span>
              </li>
              <li className="py-2 flex items-center justify-between">
                <span className="text-sm text-zinc-700 capitalize">ai_overviews</span>
                <span className="text-sm text-zinc-900">3/2 cited • avg pos 2.0</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Intelligence Cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5 bg-white/70 backdrop-blur shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-zinc-900 font-semibold">Google Policy Compliance</h3>
              <span className="text-xs text-zinc-500">
                Last checked: {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* Compliance Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-600">Compliance Score</span>
                <span className="text-2xl font-bold text-green-600">87%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '87%' }}></div>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-700">Issues Found</h4>
              <div className="space-y-2">
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-900">Content Quality</span>
                    <span className="text-xs px-2 py-1 rounded-full text-yellow-600 bg-yellow-50">medium</span>
                  </div>
                  <p className="text-sm text-zinc-600 mb-2">Some product descriptions lack sufficient detail</p>
                  <p className="text-xs text-zinc-500 italic">Add more comprehensive product information</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-900">Image Optimization</span>
                    <span className="text-xs px-2 py-1 rounded-full text-blue-600 bg-blue-50">low</span>
                  </div>
                  <p className="text-sm text-zinc-600 mb-2">Some images missing alt text</p>
                  <p className="text-xs text-zinc-500 italic">Add descriptive alt text to all images</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Run Compliance Check
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white/70 backdrop-blur shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-zinc-900 font-semibold">AI Platform Performance</h3>
              <span className="text-xs text-zinc-500">Last 30 days</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">ChatGPT</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">92%</div>
                  <div className="text-xs text-green-600">+5% this week</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Gemini</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">88%</div>
                  <div className="text-xs text-green-600">+3% this week</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Perplexity</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">95%</div>
                  <div className="text-xs text-green-600">+2% this week</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">AI Overviews</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">76%</div>
                  <div className="text-xs text-red-600">-1% this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">High Priority</h4>
              <p className="text-sm text-blue-800">
                Optimize your Google Business Profile for better AI Overviews visibility.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h4 className="text-sm font-semibold text-green-900 mb-1">Medium Priority</h4>
              <p className="text-sm text-green-800">
                Add more customer reviews to improve trust signals across all platforms.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Low Priority</h4>
              <p className="text-sm text-yellow-800">
                Consider expanding your content strategy to target long-tail keywords.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Full Report
          </button>
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Schedule Consultation
          </button>
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export Data
          </button>
        </div>
      </main>
    </div>
  )
}