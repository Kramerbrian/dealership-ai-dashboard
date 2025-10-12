/**
 * DealershipAI v2.0 - Mystery Shop Panel Component
 * Enterprise tier only - displays mystery shop test results and scheduling
 */

import React, { useState, useEffect } from 'react';
import { TierGate } from './TierGate';

interface MysteryShopPanelProps {
  dealershipId: string;
  userId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  className?: string;
}

interface MysteryShopTest {
  id: string;
  testType: string;
  score: number;
  responseTime: number | null;
  personalization: number;
  transparency: number;
  followUp: number;
  notes: string;
  createdAt: string;
  status: 'completed' | 'pending';
}

interface MysteryShopData {
  dealership: {
    id: string;
    name: string;
    domain: string;
  };
  tests: MysteryShopTest[];
  averageScores: {
    responseTime: number;
    personalization: number;
    transparency: number;
    followUp: number;
    overall: number;
  } | null;
  totalTests: number;
  completedTests: number;
}

const TEST_TYPES = {
  EMAIL_RESPONSE: 'Email Response',
  CHAT_WIDGET: 'Chat Widget',
  PHONE_SIMULATION: 'Phone Call',
  WEBSITE_FORM: 'Website Form'
};

export function MysteryShopPanel({ 
  dealershipId, 
  userId, 
  plan, 
  className = '' 
}: MysteryShopPanelProps) {
  const [mysteryShopData, setMysteryShopData] = useState<MysteryShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (plan === 'ENTERPRISE') {
      fetchMysteryShopData();
    }
  }, [dealershipId, userId, plan]);

  const fetchMysteryShopData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mystery-shop?dealershipId=${dealershipId}&userId=${userId}&plan=${plan}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Mystery shop testing requires Enterprise tier');
          return;
        }
        throw new Error('Failed to fetch mystery shop data');
      }
      
      const data = await response.json();
      setMysteryShopData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const scheduleTest = async (testType: string) => {
    try {
      setScheduling(true);
      const response = await fetch('/api/mystery-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealershipId,
          userId,
          plan,
          testType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule test');
      }

      const result = await response.json();
      
      // Refresh data
      await fetchMysteryShopData();
      
      // Show success message
      alert(`Test scheduled successfully! ${result.message}`);
    } catch (err) {
      alert(`Failed to schedule test: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScheduling(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatResponseTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

    return (
    <TierGate requiredTier="ENTERPRISE" currentTier={plan}>
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Mystery Shop Testing</h3>
          <div className="text-sm text-gray-500">
            {mysteryShopData?.totalTests} tests • {mysteryShopData?.completedTests} completed
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-24 bg-gray-200 rounded"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={fetchMysteryShopData}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {mysteryShopData && !loading && (
          <>
            {/* Average Scores */}
            {mysteryShopData.averageScores && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Average Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {mysteryShopData.averageScores.overall.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Overall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatResponseTime(mysteryShopData.averageScores.responseTime)}
                    </div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                      <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {mysteryShopData.averageScores.personalization.toFixed(1)}
                      </div>
                    <div className="text-sm text-gray-600">Personalization</div>
                      </div>
                      <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {mysteryShopData.averageScores.transparency.toFixed(1)}
                      </div>
                    <div className="text-sm text-gray-600">Transparency</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
            {/* Schedule New Tests */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Schedule New Test</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(TEST_TYPES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => scheduleTest(key)}
                    disabled={scheduling}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scheduling ? 'Scheduling...' : `Test ${label}`}
                  </button>
                ))}
              </div>
                    </div>

            {/* Test Results */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent Tests</h4>
              {mysteryShopData.tests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tests scheduled yet. Schedule your first test above.
                </div>
              ) : (
                <div className="space-y-3">
                  {mysteryShopData.tests.map((test) => (
                    <div key={test.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">
                            {test.testType === 'EMAIL_RESPONSE' && '📧'}
                            {test.testType === 'CHAT_WIDGET' && '💬'}
                            {test.testType === 'PHONE_SIMULATION' && '📞'}
                            {test.testType === 'WEBSITE_FORM' && '📝'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {TEST_TYPES[test.testType as keyof typeof TEST_TYPES]}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </div>
                          </div>
          </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            test.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {test.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                          {test.status === 'completed' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(test.score)}`}>
                              {test.score.toFixed(1)}
                            </span>
        )}
      </div>
            </div>
            
                      {test.status === 'completed' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Response Time</div>
                            <div className="font-medium">{formatResponseTime(test.responseTime)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Personalization</div>
                            <div className="font-medium">{test.personalization.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Transparency</div>
                            <div className="font-medium">{test.transparency.toFixed(1)}</div>
                          </div>
              <div>
                            <div className="text-gray-500">Follow-up</div>
                            <div className="font-medium">{test.followUp.toFixed(1)}</div>
                          </div>
                        </div>
                      )}

                      {test.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {test.notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              )}
            </div>
          </>
      )}
    </div>
    </TierGate>
  );
}