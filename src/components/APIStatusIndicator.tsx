'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { APIStatusMonitor } from '@/lib/api-error-handler';

interface APIStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

interface ServiceStatus {
  name: string;
  available: boolean;
  lastError?: string;
  retryAfter?: number;
  resetTime?: string;
}

export default function APIStatusIndicator({ 
  className = '', 
  showDetails = false 
}: APIStatusIndicatorProps) {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatuses = () => {
      const allStatuses = APIStatusMonitor.getAllStatuses();
      const serviceStatuses: ServiceStatus[] = [
        {
          name: 'OpenAI',
          available: allStatuses.openai?.available ?? true,
          lastError: allStatuses.openai?.lastError?.message,
          retryAfter: allStatuses.openai?.retryAfter,
          resetTime: allStatuses.openai?.resetTime
        },
        {
          name: 'Anthropic',
          available: allStatuses.anthropic?.available ?? true,
          lastError: allStatuses.anthropic?.lastError?.message,
          retryAfter: allStatuses.anthropic?.retryAfter,
          resetTime: allStatuses.anthropic?.resetTime
        }
      ];
      setStatuses(serviceStatuses);
    };

    // Update immediately
    updateStatuses();

    // Update every 30 seconds
    const interval = setInterval(updateStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = statuses.every(s => s.available) ? 'healthy' : 
                       statuses.some(s => s.available) ? 'degraded' : 'unhealthy';

  const getStatusIcon = (available: boolean) => {
    if (available) {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
    return <XCircleIcon className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (available: boolean) => {
    return available ? 'text-green-500' : 'text-red-500';
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'healthy': return 'All services operational';
      case 'degraded': return 'Some services unavailable';
      case 'unhealthy': return 'Services temporarily unavailable';
      default: return 'Checking status...';
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1 ${getOverallStatusColor()}`}>
          {overallStatus === 'healthy' && <CheckCircleIcon className="w-4 h-4" />}
          {overallStatus === 'degraded' && <ExclamationTriangleIcon className="w-4 h-4" />}
          {overallStatus === 'unhealthy' && <XCircleIcon className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {getOverallStatusText()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        <div className={`flex items-center gap-1 ${getOverallStatusColor()}`}>
          {overallStatus === 'healthy' && <CheckCircleIcon className="w-4 h-4" />}
          {overallStatus === 'degraded' && <ExclamationTriangleIcon className="w-4 h-4" />}
          {overallStatus === 'unhealthy' && <XCircleIcon className="w-4 h-4" />}
          <span className="text-sm font-medium">
            API Status
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2"
          >
            {statuses.map((status) => (
              <div
                key={status.name}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.available)}
                  <div>
                    <div className="font-medium text-sm">{status.name}</div>
                    <div className={`text-xs ${getStatusColor(status.available)}`}>
                      {status.available ? 'Operational' : 'Unavailable'}
                    </div>
                  </div>
                </div>
                
                {!status.available && (
                  <div className="text-right">
                    {status.resetTime && (
                      <div className="text-xs text-gray-400">
                        Resets: {status.resetTime}
                      </div>
                    )}
                    {status.lastError && (
                      <div className="text-xs text-red-400 max-w-xs truncate" title={status.lastError}>
                        {status.lastError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {overallStatus !== 'healthy' && (
              <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <InformationCircleIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-300">
                  <div className="font-medium mb-1">Service Notice</div>
                  <div>
                    Some AI services are temporarily unavailable due to usage limits. 
                    The system will automatically retry when limits reset. 
                    Cached data and fallback responses are being used to maintain functionality.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
