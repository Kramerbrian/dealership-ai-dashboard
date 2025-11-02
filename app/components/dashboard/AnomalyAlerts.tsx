/**
 * Anomaly Detection Alerts Component
 * 
 * Displays detected anomalies with severity-based styling
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, AlertCircle, Info, 
  X, TrendingDown, TrendingUp, Activity, CheckCircle2
} from 'lucide-react';
import { detectAnomalies, Anomaly, CurrentData, HistoricalData } from '@/utils/anomalyDetection';
import { AlertBanner, useAlerts } from '@/app/components/dashboard/AlertBanner';

interface AnomalyAlertsProps {
  currentData: CurrentData;
  historicalData: HistoricalData[];
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({
  currentData,
  historicalData,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const { addAlert } = useAlerts();

  const checkAnomalies = () => {
    const detected = detectAnomalies(currentData, historicalData);
    
    // Filter out dismissed anomalies
    const activeAnomalies = detected.filter(
      a => !dismissedIds.has(`${a.type}-${a.timestamp.getTime()}`)
    );
    
    setAnomalies(activeAnomalies);

    // Show banner for critical anomalies
    const critical = activeAnomalies.find(a => a.severity === 'critical');
    if (critical && !dismissedIds.has(`banner-${critical.type}`)) {
      addAlert(
        'critical',
        critical.message,
        {
          label: 'View Details',
          onClick: () => {
            // Scroll to anomaly section
            document.getElementById('anomaly-alerts')?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        10000
      );
    }
  };

  useEffect(() => {
    checkAnomalies();

    if (autoRefresh) {
      const interval = setInterval(checkAnomalies, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [currentData, historicalData, autoRefresh, refreshInterval]);

  const handleDismiss = (anomaly: Anomaly) => {
    const id = `${anomaly.type}-${anomaly.timestamp.getTime()}`;
    setDismissedIds(prev => new Set([...prev, id]));
    setAnomalies(prev => prev.filter(a => a !== anomaly));
  };

  if (anomalies.length === 0) {
    return (
      <div id="anomaly-alerts" className="p-6 rounded-xl bg-gray-800 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">All Systems Normal</h3>
            <p className="text-sm text-gray-400">No anomalies detected</p>
          </div>
        </div>
      </div>
    );
  }

  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      label: 'Critical'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      label: 'Warning'
    },
    info: {
      icon: Info,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'Info'
    }
  };

  // Group by severity
  const grouped = anomalies.reduce((acc, anomaly) => {
    if (!acc[anomaly.severity]) {
      acc[anomaly.severity] = [];
    }
    acc[anomaly.severity].push(anomaly);
    return acc;
  }, {} as Record<string, Anomaly[]>);

  return (
    <div id="anomaly-alerts" className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          Anomaly Detection
        </h2>
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold">
          {anomalies.length} {anomalies.length === 1 ? 'Issue' : 'Issues'} Detected
        </span>
      </div>

      {/* Critical Anomalies */}
      {grouped.critical && grouped.critical.length > 0 && (
        <div className="space-y-3">
          {grouped.critical.map((anomaly, index) => {
            const config = severityConfig.critical;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={`${anomaly.type}-${anomaly.timestamp.getTime()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.border} ${config.bg} relative`}
              >
                <button
                  onClick={() => handleDismiss(anomaly)}
                  className="absolute top-3 right-3 p-1 rounded hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="flex items-start gap-3 pr-8">
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.color} ${config.bg}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {anomaly.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-2">{anomaly.message}</p>
                    <p className="text-sm text-gray-400">{anomaly.recommendation}</p>
                    {anomaly.metadata && (
                      <details className="mt-3">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(anomaly.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Warning Anomalies */}
      {grouped.warning && grouped.warning.length > 0 && (
        <div className="space-y-3">
          {grouped.warning.map((anomaly, index) => {
            const config = severityConfig.warning;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={`${anomaly.type}-${anomaly.timestamp.getTime()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.border} ${config.bg} relative`}
              >
                <button
                  onClick={() => handleDismiss(anomaly)}
                  className="absolute top-3 right-3 p-1 rounded hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="flex items-start gap-3 pr-8">
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.color} ${config.bg}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-2">{anomaly.message}</p>
                    <p className="text-sm text-gray-400">{anomaly.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info Anomalies */}
      {grouped.info && grouped.info.length > 0 && (
        <div className="space-y-3">
          {grouped.info.map((anomaly, index) => {
            const config = severityConfig.info;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={`${anomaly.type}-${anomaly.timestamp.getTime()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.border} ${config.bg} relative`}
              >
                <button
                  onClick={() => handleDismiss(anomaly)}
                  className="absolute top-3 right-3 p-1 rounded hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="flex items-start gap-3 pr-8">
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">{anomaly.message}</p>
                    <p className="text-sm text-gray-400">{anomaly.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

