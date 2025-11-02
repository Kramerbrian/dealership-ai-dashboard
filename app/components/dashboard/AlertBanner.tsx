'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Info, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'critical';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoHide?: number; // milliseconds
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  action,
  dismissible = true,
  autoHide,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-hide countdown
  useEffect(() => {
    if (!autoHide) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoHide) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [autoHide]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  // Type configuration
  const config = {
    info: {
      icon: Info,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      progressBg: 'bg-cyan-500'
    },
    success: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      progressBg: 'bg-green-500'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      progressBg: 'bg-yellow-500'
    },
    critical: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      progressBg: 'bg-red-500'
    }
  };

  const typeConfig = config[type];
  const Icon = typeConfig.icon;

  // Easter egg: If message contains "flux capacitor", add special styling
  const isFluxCapacitor = message.toLowerCase().includes('flux capacitor');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`relative ${typeConfig.bg} border ${typeConfig.border} 
            border-b shadow-sm`}
        >
          {/* Auto-hide progress bar */}
          {autoHide && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-gray-800 w-full">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: 'linear' }}
                className={`h-full ${typeConfig.progressBg} transition-all duration-50`}
              />
            </div>
          )}

          <div className="max-w-[1920px] mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 ${isFluxCapacitor ? 'animate-pulse' : ''}`}>
                <Icon className={`w-5 h-5 ${typeConfig.color}`} />
              </div>

              {/* Message */}
              <p className="flex-1 text-sm text-white font-medium">
                {message}
              </p>

              {/* Action Button */}
              {action && (
                <button
                  onClick={action.onClick}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                    hover:scale-105 ${typeConfig.color} ${typeConfig.bg} border ${typeConfig.border}
                    hover:brightness-110`}
                >
                  {action.label}
                </button>
              )}

              {/* Dismiss Button */}
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 rounded hover:bg-gray-800/50 transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Utility hook for managing multiple alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: AlertBannerProps['type'];
    message: string;
    action?: AlertBannerProps['action'];
    autoHide?: number;
  }>>([]);

  const addAlert = (
    type: AlertBannerProps['type'],
    message: string,
    action?: AlertBannerProps['action'],
    autoHide?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, type, message, action, autoHide }]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return { alerts, addAlert, removeAlert };
};
