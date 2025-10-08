'use client';

import React, { useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

export const ApiIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testInputs, setTestInputs] = useState({
    dealershipUrl: 'https://example-dealership.com',
    businessName: 'Example Dealership',
    location: 'New York, NY',
    propertyId: '123456789',
    domain: 'example-dealership.com'
  });

  const {
    isAuthenticated,
    getAnalyticsData,
    getPageSpeedData,
    getSEMrushData,
    getYelpData,
    getAICitationAnalysis,
    getBatchAnalysis,
    getGoogleAnalyticsProperties,
    getGoogleBusinessAccounts,
    getGoogleSearchConsoleSites
  } = useApiClient();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    
    // Update test status to pending
    setTestResults(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status: 'pending' as const }
        : test
    ));

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'success' as const, data: result, duration }
          : test
      ));
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      setTestResults(prev => prev.map(test => 
        test.name === testName 
          ? { ...test, status: 'error' as const, error: error.message, duration }
          : test
      ));
    }
  };

  const runAllTests = async () => {
    if (!isAuthenticated) {
      alert('Please connect Google Services first');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    // Initialize test results
    const tests = [
      'Google Analytics Properties',
      'Google Business Accounts', 
      'Google Search Console Sites',
      'PageSpeed Analysis',
      'SEMrush Data',
      'Yelp Reviews',
      'AI Citation Analysis',
      'Batch Analysis'
    ];

    setTestResults(tests.map(name => ({ name, status: 'pending' as const })));

    // Run tests in sequence to avoid rate limiting
    await runTest('Google Analytics Properties', () => getGoogleAnalyticsProperties());
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('Google Business Accounts', () => getGoogleBusinessAccounts());
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('Google Search Console Sites', () => getGoogleSearchConsoleSites());
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('PageSpeed Analysis', () => getPageSpeedData(testInputs.dealershipUrl));
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('SEMrush Data', () => getSEMrushData(testInputs.domain));
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('Yelp Reviews', () => getYelpData(undefined, testInputs.businessName, testInputs.location));
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('AI Citation Analysis', () => getAICitationAnalysis(testInputs.businessName, testInputs.location));
    await new Promise(resolve => setTimeout(resolve, 1000));

    await runTest('Batch Analysis', () => getBatchAnalysis(testInputs.dealershipUrl, testInputs.businessName, testInputs.location));

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <div className="text-green-600">✓</div>;
      case 'error':
        return <div className="text-red-600">✗</div>;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">API Integration Test Suite</h2>
      
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ Please connect Google Services first to run the tests.
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dealership URL
          </label>
          <input
            type="url"
            value={testInputs.dealershipUrl}
            onChange={(e) => setTestInputs(prev => ({ ...prev, dealershipUrl: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example-dealership.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            value={testInputs.businessName}
            onChange={(e) => setTestInputs(prev => ({ ...prev, businessName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Example Dealership"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={testInputs.location}
            onChange={(e) => setTestInputs(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New York, NY"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domain
          </label>
          <input
            type="text"
            value={testInputs.domain}
            onChange={(e) => setTestInputs(prev => ({ ...prev, domain: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example-dealership.com"
          />
        </div>
      </div>

      <button
        onClick={runAllTests}
        disabled={isRunning || !isAuthenticated}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white
          ${isRunning || !isAuthenticated
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }
        `}
      >
        {isRunning ? 'Running Tests...' : 'Run All API Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Test Results</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.name}</span>
                </div>
                {result.duration && (
                  <span className="text-sm text-gray-500">
                    {result.duration}ms
                  </span>
                )}
              </div>
              
              {result.error && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {result.error}
                </div>
              )}
              
              {result.data && result.status === 'success' && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Success - Data received
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Test Coverage</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Google Analytics Data API</li>
          <li>• Google PageSpeed Insights API</li>
          <li>• Google Business Profile API</li>
          <li>• Google Search Console API</li>
          <li>• SEMrush API (if configured)</li>
          <li>• Yelp Fusion API</li>
          <li>• OpenAI GPT-4 API</li>
          <li>• Batch analysis endpoint</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiIntegrationTest;
