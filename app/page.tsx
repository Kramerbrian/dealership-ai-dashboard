export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            DealershipAI
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            The platform 240+ dealerships use to control their AI visibility across ChatGPT, Claude, and Perplexity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg"
            >
              Track AI Visibility
            </a>
            <a 
              href="/admin" 
              className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 border border-white/20"
            >
              Admin Panel
            </a>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">AI Visibility Score</h3>
            <p className="text-gray-400">
              Track visibility across 6 AI engines with real-time scoring and trend analysis.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Competitive Intelligence</h3>
            <p className="text-gray-400">
              See how you rank against competitors and discover what drives their success.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Enterprise Ready</h3>
            <p className="text-gray-400">
              SOC 2 compliant with SSO, RBAC, and API access for dealer groups.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}