'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  CpuChipIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useGptMetrics } from '@/lib/fetchers/gptMetrics';
import { 
  AIVMetricCard, 
  ATIMetricCard, 
  CRSMetricCard, 
  ElasticityMetricCard,
  R2MetricCard,
  RegimeMetricCard 
} from '@/components/ui/MetricCard';

interface EnhancedAlgorithmicVisibilityTabProps {
  auditData?: any;
  tenantId?: string;
}

export default function EnhancedAlgorithmicVisibilityTab({ 
  auditData, 
  tenantId = "123" 
}: EnhancedAlgorithmicVisibilityTabProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedRegion, setSelectedRegion] = useState<'US' | 'CA' | 'UK' | 'AU'>('US');

  // Fetch GPT metrics using SWR
  const { 
    data, 
    error, 
    isLoading, 
    mutate,
    aiv,
    ati,
    crs,
    elasticity,
    r2,
    drivers,
    regime,
    confidenceInterval,
    lastUpdated
  } = useGptMetrics(tenantId);

  const handleRefresh = () => {
    mutate();
  };

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      tenantId,
      timestamp: new Date().toISOString(),
      metrics: {
        aiv,
        ati,
        crs,
        elasticity,
        r2,
        regime,
        confidenceInterval
      },
      drivers,
      lastUpdated
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiv-metrics-${tenantId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Metrics</h3>
          <p className="text-red-300 mb-4">
            Failed to load Algorithmic Visibility Index metrics: {error.message}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            Algorithmic Visibility Index™
          </h2>
          <p className="text-gray-400 mt-1">
            GPT-5 powered AIV™, ATI™, CRS, and Elasticity analysis with proprietary models
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as 'US' | 'CA' | 'UK' | 'AU')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="US">🇺🇸 United States</option>
            <option value="CA">🇨🇦 Canada</option>
            <option value="UK">🇬🇧 United Kingdom</option>
            <option value="AU">🇦🇺 Australia</option>
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Core Metrics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AIVMetricCard value={aiv} loading={isLoading} />
        <ATIMetricCard value={ati} loading={isLoading} />
        <CRSMetricCard value={crs} loading={isLoading} />
        <ElasticityMetricCard value={elasticity} loading={isLoading} />
        <R2MetricCard value={r2} loading={isLoading} />
        <RegimeMetricCard regime={regime} loading={isLoading} />
      </div>

      {/* Confidence Interval */}
      {confidenceInterval && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Elasticity Confidence Interval</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">95% CI:</div>
            <div className="text-lg font-semibold text-white">
              ${confidenceInterval[0].toLocaleString()} - ${confidenceInterval[1].toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              per +1 AIV point
            </div>
          </div>
        </motion.div>
      )}

      {/* SHAP Drivers */}
      {drivers && (drivers.aiv.length > 0 || drivers.ati.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">SHAP-Style Top 5 Drivers</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-white mb-3">AIV™ Drivers</h4>
              <div className="space-y-3">
                {drivers.aiv.slice(0, 5).map((driver, index) => (
                  <div key={driver.feature} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-300">#{index + 1}</span>
                      <span className="text-sm text-gray-300">{driver.feature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        driver.direction === 'positive' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {driver.direction === 'positive' ? '+' : '-'}{Math.abs(driver.impact).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-white mb-3">ATI™ Drivers</h4>
              <div className="space-y-3">
                {drivers.ati.slice(0, 5).map((driver, index) => (
                  <div key={driver.feature} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-300">#{index + 1}</span>
                      <span className="text-sm text-gray-300">{driver.feature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        driver.direction === 'positive' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {driver.direction === 'positive' ? '+' : '-'}{Math.abs(driver.impact).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* GPT Analysis Details */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">GPT-5 Analysis Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Analysis Type</div>
              <div className="text-lg font-semibold text-white">Comprehensive</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">GPT Model</div>
              <div className="text-lg font-semibold text-white">GPT-5</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Reasoning Effort</div>
              <div className="text-lg font-semibold text-white">Medium</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Service Token</div>
              <div className="text-lg font-semibold text-white">role:system</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Computing...' : 'Refresh Metrics'}
        </button>
        <button 
          onClick={handleExport}
          disabled={!data}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Export AIV Report
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          View Detailed Analysis
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400">GPT-5 Analysis in Progress</h3>
              <p className="text-blue-300 text-sm">
                Computing AIV™, ATI™, CRS, and Elasticity metrics using proprietary algorithms...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
