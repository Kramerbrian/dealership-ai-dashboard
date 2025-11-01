'use client';

import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { X, TrendingDown, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';

interface RaRModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealerId: string;
  month?: string;
}

export default function RaRModal({ isOpen, onClose, dealerId, month }: RaRModalProps) {
  const params = new URLSearchParams({ dealerId });
  if (month) params.append('month', month);

  const { data, error, isLoading, mutate } = useSWR(
    isOpen ? `/api/rar/summary?${params.toString()}` : null,
    (url) => fetch(url).then((r) => r.json()),
    {
      refreshInterval: 30000, // Auto-refresh every 30s
    }
  );

  const d = data || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Revenue at Risk</h2>
                  <p className="text-sm text-gray-600">AI snippet visibility impact analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => mutate()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Error loading RaR data</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error.message || 'Failed to fetch data'}</p>
                </div>
              )}

              {!isLoading && !error && (
                <div className="space-y-6">
                  {/* Main Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                      <div className="text-sm text-red-700 mb-2 font-medium">Total Revenue at Risk</div>
                      <div className="text-4xl font-bold text-red-900 font-mono tabular-nums">
                        {d.rar ? `$${Math.round(d.rar).toLocaleString()}` : '—'}
                      </div>
                      <div className="text-xs text-red-600 mt-2">Current month</div>
                    </div>

                    <div className="rounded-xl p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <div className="text-sm text-green-700 mb-2 font-medium">Recoverable Revenue</div>
                      <div className="text-4xl font-bold text-green-900 font-mono tabular-nums">
                        {d.recoverable ? `$${Math.round(d.recoverable).toLocaleString()}` : '—'}
                      </div>
                      <div className="text-xs text-green-600 mt-2">Actionable now</div>
                    </div>

                    <div className="rounded-xl p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                      <div className="text-sm text-orange-700 mb-2 font-medium">Lost Sales</div>
                      <div className="text-4xl font-bold text-orange-900 font-mono tabular-nums">
                        {d.lostSales ? Math.round(d.lostSales).toLocaleString() : '—'}
                      </div>
                      <div className="text-xs text-orange-600 mt-2">Estimated units</div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-6 bg-gray-50 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-4 font-medium">Conversion Funnel Impact</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Lost Sessions</span>
                          <span className="font-semibold text-gray-900 font-mono tabular-nums">
                            {d.lostSessions ? d.lostSessions.toLocaleString() : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Lost Leads</span>
                          <span className="font-semibold text-gray-900 font-mono tabular-nums">
                            {d.lostLeads ? d.lostLeads.toLocaleString() : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Lost Sales</span>
                          <span className="font-semibold text-gray-900 font-mono tabular-nums">
                            {d.lostSales ? Math.round(d.lostSales).toLocaleString() : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-6 bg-gray-50 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-4 font-medium">Metadata</div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Dealer ID</span>
                          <span className="font-mono text-gray-900">{dealerId}</span>
                        </div>
                        {month && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">Month</span>
                            <span className="font-mono text-gray-900">{month}</span>
                          </div>
                        )}
                        {d.computedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">Last Updated</span>
                            <span className="font-mono text-gray-900">
                              {new Date(d.computedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Losing Intents */}
                  {d.topLosingIntents && Array.isArray(d.topLosingIntents) && d.topLosingIntents.length > 0 && (
                    <div className="rounded-xl p-6 bg-white border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Top Losing Intents</h3>
                      </div>
                      <div className="space-y-3">
                        {(d.topLosingIntents as any[]).map((it: any, index: number) => (
                          <div
                            key={it.intent}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-900">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 capitalize">
                                  {it.intent?.replace(/_/g, ' ') || 'Unknown Intent'}
                                </div>
                                <div className="text-xs text-gray-600">Intent cluster</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-900 font-mono tabular-nums">
                                ${typeof it.rar === 'number' ? it.rar.toLocaleString() : '0'}
                              </div>
                              <div className="text-xs text-gray-600">at risk</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => window.open(`/api/rar/summary?dealerId=${dealerId}&month=${month || ''}`, '_blank')}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        fetch('/api/rar/compute', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dealerId, month: month || new Date().toISOString().slice(0, 7) + '-01' })
                        }).then(() => mutate());
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Recompute Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

