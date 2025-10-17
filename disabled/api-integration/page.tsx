'use client';

import React from 'react';

export default function ApiIntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Integration</h1>
          <p className="mt-2 text-lg text-gray-600">
            Connect external services and test API integrations for your dealership analytics.
          </p>
        </div>

        {/* Status Card */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">Backend API</p>
                  <p className="text-xs text-green-600">Running</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Google OAuth</p>
                  <p className="text-xs text-yellow-600">Not Connected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-blue-800">API Keys</p>
                  <p className="text-xs text-blue-600">Configured</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">External APIs</p>
                  <p className="text-xs text-gray-600">Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Setup */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Setup</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">1. Configure API Keys</h3>
                <p className="text-sm text-blue-700">Set up your external API credentials</p>
              </div>
              <button 
                onClick={() => window.open('https://console.cloud.google.com', '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Google Console
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-green-900">2. Test API Endpoints</h3>
                <p className="text-sm text-green-700">Verify all integrations are working</p>
              </div>
              <button 
                onClick={() => {
                  fetch('/api/health')
                    .then(res => res.json())
                    .then(data => alert('Health Check: ' + JSON.stringify(data, null, 2)))
                    .catch(err => alert('Error: ' + err.message));
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Health
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h3 className="font-medium text-purple-900">3. Connect Google Services</h3>
                <p className="text-sm text-purple-700">Authenticate with Google OAuth</p>
              </div>
              <button 
                onClick={() => {
                  fetch('/api/oauth/google/auth')
                    .then(res => res.json())
                    .then(data => {
                      if (data.authUrl) {
                        window.location.href = data.authUrl;
                      } else {
                        alert('OAuth setup required. Please configure Google Client ID and Secret.');
                      }
                    })
                    .catch(err => alert('Error: ' + err.message));
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Connect Google
              </button>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free APIs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Free APIs</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-medium">Google Analytics Data API</h4>
                <p className="text-sm text-gray-600">Website traffic and user behavior data</p>
                <p className="text-xs text-green-600">Free: 200K requests/day</p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-medium">Google PageSpeed Insights</h4>
                <p className="text-sm text-gray-600">Website performance and Core Web Vitals</p>
                <p className="text-xs text-green-600">Free: 25K requests/day</p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-medium">Google Business Profile</h4>
                <p className="text-sm text-gray-600">Business information and reviews</p>
                <p className="text-xs text-green-600">Free</p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-medium">Google Search Console</h4>
                <p className="text-sm text-gray-600">Search performance and indexing data</p>
                <p className="text-xs text-green-600">Free</p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-medium">Yelp Fusion API</h4>
                <p className="text-sm text-gray-600">Business reviews and ratings</p>
                <p className="text-xs text-green-600">Free: 5K requests/day</p>
              </div>
            </div>
          </div>

          {/* Paid APIs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Paid APIs</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium">SEMrush API</h4>
                <p className="text-sm text-gray-600">SEO analysis and competitor data</p>
                <p className="text-xs text-blue-600">$99-199/month</p>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium">Ahrefs API</h4>
                <p className="text-sm text-gray-600">Backlink analysis and keyword research</p>
                <p className="text-xs text-blue-600">$179+/month</p>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium">OpenAI GPT-4</h4>
                <p className="text-sm text-gray-600">AI-powered citation analysis</p>
                <p className="text-xs text-blue-600">~$0.03 per 1K tokens</p>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium">Anthropic Claude</h4>
                <p className="text-sm text-gray-600">Alternative AI analysis</p>
                <p className="text-xs text-blue-600">Pay-per-use</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Optimization */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Optimization Strategies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Caching</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cache API responses for 5-15 minutes</li>
                <li>• Use Redis for production caching</li>
                <li>• Reduces requests by 80-90%</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Smart Refresh</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Only refresh visible tabs</li>
                <li>• Use webhooks where available</li>
                <li>• Batch API calls</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Free Alternatives</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Search Console instead of SEMrush</li>
                <li>• Lighthouse CLI instead of PageSpeed API</li>
                <li>• Web scraping for competitor data</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Usage Monitoring</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set daily request limits</li>
                <li>• Monitor API costs</li>
                <li>• Implement rate limiting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">Setup Instructions</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. Configure API Keys:</strong> Run <code className="bg-blue-100 px-2 py-1 rounded">./scripts/setup-api-keys.sh</code></p>
            <p><strong>2. Start Development Server:</strong> <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code></p>
            <p><strong>3. Connect Google Services:</strong> Use the OAuth button above</p>
            <p><strong>4. Test Integrations:</strong> Use the test buttons above</p>
            <p><strong>5. Configure Dealership:</strong> Add your business information</p>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>Documentation:</strong> <a href="#" className="text-blue-600 hover:underline">API Integration Guide</a></p>
            <p>• <strong>GitHub:</strong> <a href="#" className="text-blue-600 hover:underline">Report Issues</a></p>
            <p>• <strong>Support:</strong> <a href="#" className="text-blue-600 hover:underline">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}