'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { trpc } from '@/lib/trpc';

interface AlgorithmicVisibilityTabProps {
  auditData?: any;
}

export default function AlgorithmicVisibilityTab({ auditData }: AlgorithmicVisibilityTabProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedRegion, setSelectedRegion] = useState<'US' | 'CA' | 'UK' | 'AU'>('US');

  // Fetch Algorithmic Visibility Index data
  // TEMPORARILY DISABLED - algorithmicVisibility router causes build errors
  // const { data: aivData, isLoading: aivLoading } = trpc.algorithmicVisibility.getAIVDashboard.useQuery({
  //   useDemoData: true,
  //   timeframe: selectedTimeframe
  // });
  const aivData: any = null;
  const aivLoading = false;

  // Fetch regional metrics
  // const { data: regionalData, isLoading: regionalLoading } = trpc.algorithmicVisibility.getRegionalMetrics.useQuery({
  //   regions: [selectedRegion],
  //   useDemoData: true
  // });
  const regionalData: any = null;
  const regionalLoading = false;

  // Fetch SHAP drivers
  // const { data: shapData, isLoading: shapLoading } = trpc.algorithmicVisibility.getSHAPDrivers.useQuery({
  //   useDemoData: true
  // });
  const shapData: any = null;
  const shapLoading = false;

  // Fetch elasticity analysis
  // const { data: elasticityData, isLoading: elasticityLoading } = trpc.algorithmicVisibility.getElasticityAnalysis.useQuery({
  //   weeks: 8,
  //   useDemoData: true
  // });
  const elasticityData: any = null;
  const elasticityLoading = false;

  // Fetch regime status
  // const { data: regimeData, isLoading: regimeLoading } = trpc.algorithmicVisibility.getRegimeStatus.useQuery({
  //   useDemoData: true
  // });
  const regimeData: any = null;
  const regimeLoading = false;

  // Manual computation mutation
  // const computeMetrics = trpc.algorithmicVisibility.computeMetrics.useMutation();
  const computeMetrics = { mutate: () => {}, isLoading: false };

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Normal': return 'text-green-400 bg-green-500/20';
      case 'Shift Detected': return 'text-yellow-400 bg-yellow-500/20';
      case 'Quarantine': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRegimeIcon = (regime: string) => {
    switch (regime) {
      case 'Normal': return <CheckCircleIcon className="w-4 h-4" />;
      case 'Shift Detected': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'Quarantine': return <ShieldCheckIcon className="w-4 h-4" />;
      default: return <ChartBarIcon className="w-4 h-4" />;
    }
  };

  const getImpactDirection = (impact: number) => {
    return impact > 0 ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  const handleComputeMetrics = async () => {
    try {
      // Mutation disabled - algorithmicVisibility router causes build errors
      computeMetrics.mutate();
    } catch (error) {
      console.error('Failed to compute metrics:', error);
    }
  };

  if (aivLoading || regionalLoading || shapLoading || elasticityLoading || regimeLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
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
            Proprietary AIV™, ATI™, CRS, and Elasticity models with FastSearch/RankEmbed clarity layers
          </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">AIV™</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(aivData?.aiv.finalAIV || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Algorithmic Visibility Index
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm text-gray-400">ATI™</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(aivData?.ati.finalATI || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Algorithmic Trust Index
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm text-gray-400">CRS</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(aivData?.crs.finalCRS || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Composite Reputation Score
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-sm text-gray-400">Elasticity</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${Math.round(aivData?.elasticity.elasticity || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            $ per +1 AIV point
          </div>
        </motion.div>
      </div>

      {/* Regime Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Regime Status</h3>
          <div className="flex items-center gap-2">
            {getRegimeIcon(regimeData?.regime.regime || 'Normal')}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRegimeColor(regimeData?.regime.regime || 'Normal')}`}>
              {regimeData?.regime.regime || 'Normal'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="text-sm text-gray-400">R² Quality</div>
            <div className="text-lg font-semibold text-white">
              {((regimeData?.regime.rSquared || 0) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="text-sm text-gray-400">Input Sigma</div>
            <div className="text-lg font-semibold text-white">
              {(regimeData?.regime.inputSigma || 0).toFixed(2)}σ
            </div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="text-sm text-gray-400">System Status</div>
            <div className="text-lg font-semibold text-white">
              {regimeData?.regime.frozen ? 'Frozen' : 'Active'}
            </div>
          </div>
        </div>
        {regimeData?.regime.reason && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="text-sm text-yellow-400">
              <strong>Alert:</strong> {regimeData.regime.reason}
            </div>
          </div>
        )}
      </motion.div>

      {/* AIV Components Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">AIV™ Components</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">AEO Score</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(aivData?.aiv.baseComponents.aeo || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-purple-500"
                style={{ width: `${aivData?.aiv.baseComponents.aeo || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">SEO Score</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(aivData?.aiv.baseComponents.seo || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-blue-500"
                style={{ width: `${aivData?.aiv.baseComponents.seo || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">GEO Score</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(aivData?.aiv.baseComponents.geo || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-green-500"
                style={{ width: `${aivData?.aiv.baseComponents.geo || 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Clarity Layer (SCS/SIS/ADI/SCR)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Search Clarity Score</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(aivData?.aiv.clarityLayer.scs || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-cyan-500"
                style={{ width: `${aivData?.aiv.clarityLayer.scs || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Search Intent Score</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(aivData?.aiv.clarityLayer.sis || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-orange-500"
                style={{ width: `${aivData?.aiv.clarityLayer.sis || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Answer Depth Index</span>
              <span className="text-lg font-semibold text-white">
                {Math.round(aivData?.aiv.clarityLayer.adi || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-pink-500"
                style={{ width: `${aivData?.aiv.clarityLayer.adi || 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* SHAP Drivers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">SHAP-Style Top 5 Drivers</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-white mb-3">AIV™ Drivers</h4>
            <div className="space-y-3">
              {shapData?.drivers.aivDrivers.slice(0, 5).map((driver: any, index: number) => (
                <div key={driver.feature} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-300">#{index + 1}</span>
                    <span className="text-sm text-gray-300">{driver.feature}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getImpactDirection(driver.impact)}
                    <span className="text-sm font-semibold text-white">
                      {Math.round(Math.abs(driver.impact))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-white mb-3">ATI™ Drivers</h4>
            <div className="space-y-3">
              {shapData?.drivers.atiDrivers.slice(0, 5).map((driver: any, index: number) => (
                <div key={driver.feature} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-300">#{index + 1}</span>
                    <span className="text-sm text-gray-300">{driver.feature}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getImpactDirection(driver.impact)}
                    <span className="text-sm font-semibold text-white">
                      {Math.round(Math.abs(driver.impact))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional Metrics */}
      {regionalData?.metrics && regionalData.metrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Regional Metrics - {selectedRegion}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {regionalData.metrics.map((metric: any) => (
              <div key={metric.region} className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Market Multiplier</div>
                <div className="text-lg font-semibold text-white mb-4">
                  {metric.marketMultiplier}x
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">AIV</span>
                    <span className="text-sm font-medium text-white">{Math.round(metric.aiv)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">ATI</span>
                    <span className="text-sm font-medium text-white">{Math.round(metric.ati)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">CRS</span>
                    <span className="text-sm font-medium text-white">{Math.round(metric.crs)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleComputeMetrics}
          disabled={computeMetrics.isLoading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {computeMetrics.isLoading ? 'Computing...' : 'Compute Metrics'}
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Export AIV Report
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
}
