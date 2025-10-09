export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DealershipAI Dashboard</h1>
          <p className="text-gray-600 mt-2">AI Visibility Analytics for Car Dealerships</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Visibility Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Visibility Score</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
            <p className="text-sm text-gray-600">Above average performance</p>
          </div>
          
          {/* ChatGPT Citations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ChatGPT Citations</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">23</div>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          
          {/* Claude Mentions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Claude Mentions</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">15</div>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          
          {/* Perplexity References */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Perplexity References</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          
          {/* Total AI Queries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total AI Queries</h3>
            <div className="text-3xl font-bold text-indigo-600 mb-2">1,247</div>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          
          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
            <div className="text-3xl font-bold text-red-600 mb-2">12.3%</div>
            <p className="text-sm text-gray-600">AI-driven leads</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Citations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">"Best car dealership in [City]"</p>
                <p className="text-sm text-gray-600">Cited by ChatGPT • 2 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Positive</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">"Reliable auto service near me"</p>
                <p className="text-sm text-gray-600">Cited by Claude • 4 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Neutral</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">"New car financing options"</p>
                <p className="text-sm text-gray-600">Cited by Perplexity • 6 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Positive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}