'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, Building } from 'lucide-react';

interface TierBadgeProps {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  size?: 'sm' | 'md' | 'lg';
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md' }) => {
  const tierConfig = {
    FREE: {
      name: 'Free',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      gradient: 'from-slate-500 to-slate-600'
    },
    PRO: {
      name: 'Pro',
      icon: <Crown className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      gradient: 'from-blue-500 to-cyan-500'
    },
    ENTERPRISE: {
      name: 'Enterprise',
      icon: <Building className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      gradient: 'from-purple-500 to-pink-500'
    }
  };

  const config = tierConfig[tier];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center space-x-2 rounded-lg border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <div className={`p-1 rounded-md bg-gradient-to-r ${config.gradient} text-white`}>
        {config.icon}
      </div>
      <span>{config.name}</span>
    </motion.div>
  );
};

export default TierBadge;
