export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            DealershipAI
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The only AI visibility platform built specifically for car dealerships. 
            Get cited by ChatGPT, Claude, and Perplexity when customers search for your services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Go to Dashboard
            </a>
            <a 
              href="/admin" 
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">AI Visibility</h3>
            <p className="text-gray-300">
              Optimize your dealership's presence in AI search results across ChatGPT, Claude, and Perplexity.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Real-time Analytics</h3>
            <p className="text-gray-300">
              Track your AI search performance with comprehensive analytics and insights.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Multi-tenant</h3>
            <p className="text-gray-300">
              Enterprise-ready platform supporting multiple dealerships with role-based access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}