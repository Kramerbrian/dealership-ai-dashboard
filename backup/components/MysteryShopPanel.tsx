'use client';

import React, { useState, useEffect } from 'react';
import { TierGate } from './TierGate';

interface MysteryShopResult {
  id: string;
  shopType: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scheduledFor: string;
  completedAt?: string;
  scores: {
    responseTime?: number;
    personalization?: number;
    transparency?: number;
    followUp?: number;
    overall?: number;
  };
  notes?: string;
}

interface MysteryShopPanelProps {
  dealershipId?: string;
}

export const MysteryShopPanel: React.FC<MysteryShopPanelProps> = ({ dealershipId }) => {
  const [mysteryShops, setMysteryShops] = useState<MysteryShopResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newShop, setNewShop] = useState({
    shopType: 'EMAIL',
    scheduledFor: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMysteryShops();
  }, [dealershipId]);

  const fetchMysteryShops = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mystery-shop');
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Mystery Shop automation requires Enterprise tier');
        }
        throw new Error('Failed to fetch mystery shop results');
      }
      
      const data = await response.json();
      setMysteryShops(data.mysteryShops || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mystery shop results');
    } finally {
      setLoading(false);
    }
  };

  const scheduleMysteryShop = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mystery-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newShop)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Mystery Shop automation requires Enterprise tier');
        }
        if (response.status === 429) {
          throw new Error('Daily mystery shop limit reached');
        }
        throw new Error('Failed to schedule mystery shop');
      }
      
      const data = await response.json();
      setMysteryShops(prev => [data, ...prev]);
      setShowScheduleForm(false);
      setNewShop({
        shopType: 'EMAIL',
        scheduledFor: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule mystery shop');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'SCHEDULED': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getShopTypeIcon = (shopType: string) => {
    switch (shopType) {
      case 'EMAIL': return '📧';
      case 'PHONE': return '📞';
      case 'CHAT': return '💬';
      case 'FORM': return '📝';
      default: return '🔍';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && mysteryShops.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TierGate requiredTier="ENTERPRISE" feature="Mystery Shop Automation">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🕵️</div>
              <h2 className="text-2xl font-bold text-gray-900">Mystery Shop Results</h2>
            </div>
            <p className="text-gray-600">
              Automated testing of your customer experience across all channels.
            </p>
          </div>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Schedule New Test
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Schedule Form */}
        {showScheduleForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Schedule New Mystery Shop</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Type
                </label>
                <select
                  value={newShop.shopType}
                  onChange={(e) => setNewShop(prev => ({ ...prev, shopType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="EMAIL">Email Response</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="CHAT">Chat Widget</option>
                  <option value="FORM">Contact Form</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled For
                </label>
                <input
                  type="date"
                  value={newShop.scheduledFor}
                  onChange={(e) => setNewShop(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={scheduleMysteryShop}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Test'}
              </button>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mystery Shop Results */}
        {mysteryShops.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mystery Shops Yet</h3>
            <p className="text-gray-600 mb-4">
              Schedule your first mystery shop to test your customer experience.
            </p>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Schedule First Test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mysteryShops.map((shop) => (
              <div key={shop.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getShopTypeIcon(shop.shopType)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {shop.shopType} Test
                      </h3>
                      <p className="text-sm text-gray-600">
                        Scheduled: {new Date(shop.scheduledFor).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shop.status)}`}>
                    {shop.status}
                  </div>
                </div>

                {shop.status === 'COMPLETED' && shop.scores && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {Object.entries(shop.scores).map(([key, score]) => (
                      score !== undefined && (
                        <div key={key} className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score}/100
                          </div>
                          <div className="text-xs text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {shop.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{shop.notes}</p>
                  </div>
                )}

                {shop.completedAt && (
                  <div className="mt-3 text-xs text-gray-500">
                    Completed: {new Date(shop.completedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {mysteryShops.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{mysteryShops.length}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {mysteryShops.filter(s => s.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {mysteryShops.filter(s => s.status === 'SCHEDULED').length}
                </div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {mysteryShops.filter(s => s.status === 'FAILED').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TierGate>
  );
};
