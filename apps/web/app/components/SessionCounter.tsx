'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SessionCounterProps {
  used: number;
  limit: number;
  resetAt?: string;
}

const SessionCounter: React.FC<SessionCounterProps> = ({ used, limit, resetAt }) => {
  const percentage = (used / limit) * 100;
  const remaining = limit - used;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getStatusIcon = () => {
    if (isAtLimit) return <AlertTriangle className="w-4 h-4" />;
    if (isNearLimit) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isAtLimit) return 'Limit Reached';
    if (isNearLimit) return 'Near Limit';
    return 'Good';
  };

  const formatResetDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-3 px-3 py-2 bg-slate-100 rounded-lg"
    >
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium text-slate-700">Sessions</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-bold ${getStatusColor()}`}>
          {used}
        </span>
        <span className="text-slate-500">/</span>
        <span className="text-slate-600">{limit}</span>
      </div>
      
      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="text-xs text-slate-500">
        {remaining > 0 ? `${remaining} left` : '0 left'}
      </div>
      
      {resetAt && (
        <div className="text-xs text-slate-500 hidden sm:block">
          Resets {formatResetDate(resetAt)}
        </div>
      )}
    </motion.div>
  );
};

export default SessionCounter;
