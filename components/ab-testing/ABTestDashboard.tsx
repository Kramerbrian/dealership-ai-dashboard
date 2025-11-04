'use client';

import { useEffect, useState } from 'react';
import { abTesting, TestConfig, TestResult } from '@/lib/ab-testing/framework';
import { BarChart3, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface ABTestDashboardProps {
  showAllTests?: boolean;
}

/**
 * A/B Test Results Dashboard
 * Shows statistical significance, conversion rates, and winners
 */
export function ABTestDashboard({ showAllTests = false }: ABTestDashboardProps) {
  const [tests, setTests] = useState<TestConfig[]>([]);
  const [results, setResults] = useState<Map<string, Map<string, TestResult>>>(new Map());
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load active tests
    const activeTests = abTesting.getActiveTests();
    setTests(activeTests);
    
    if (activeTests.length > 0 && !selectedTest) {
      setSelectedTest(activeTests[0].id);
    }

    // Load results for all tests
    const allResults = new Map<string, Map<string, TestResult>>();
    activeTests.forEach(test => {
      const testResults = abTesting.getResults(test.id);
      if (testResults) {
        allResults.set(test.id, testResults);
      }
    });
    setResults(allResults);
  }, [selectedTest]);

  const selectedTestConfig = tests.find(t => t.id === selectedTest);
  const selectedTestResults = selectedTest ? results.get(selectedTest) : null;
  const winner = selectedTest ? abTesting.getWinner(selectedTest) : null;

  if (tests.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-gray-200">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tests</h3>
          <p className="text-gray-600">Configure A/B tests to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">A/B Test Results</h3>
            <p className="text-sm text-gray-600">Monitor conversion rates and statistical significance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {tests.length} Active
            </div>
          </div>
        </div>
      </div>

      {/* Test Selector */}
      {tests.length > 1 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {tests.map(test => (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedTest === test.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {test.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {selectedTestConfig && selectedTestResults && (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedTestConfig.name}</h4>
            <p className="text-sm text-gray-600">{selectedTestConfig.description}</p>
          </div>

          {/* Winner Banner */}
          {winner && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Winner Identified!</p>
                <p className="text-sm text-green-700">
                  Variant "{winner}" is performing best with statistical significance.
                </p>
              </div>
            </div>
          )}

          {/* Variant Results */}
          <div className="space-y-4">
            {Array.from(selectedTestResults.entries()).map(([variantId, result]) => {
              const variant = selectedTestConfig.variants.find(v => v.id === variantId);
              const isWinner = result.isWinner || winner === variantId;
              
              return (
                <div
                  key={variantId}
                  className={`p-4 rounded-lg border-2 ${
                    isWinner
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h5 className="font-semibold text-gray-900">
                        {variant?.name || variantId}
                      </h5>
                      {isWinner && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-medium">
                          Winner
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{result.conversionRate.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Impressions</p>
                      <p className="font-semibold text-gray-900">{result.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversions</p>
                      <p className="font-semibold text-gray-900">{result.conversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Confidence</p>
                      <p className="font-semibold text-gray-900">
                        {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isWinner ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(result.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Statistical Significance Warning */}
                  {result.impressions > 0 && result.confidence < 0.95 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        Need {(selectedTestConfig.minSampleSize || 100) - result.impressions} more impressions for statistical significance
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

