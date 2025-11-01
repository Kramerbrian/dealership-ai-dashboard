'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { UpgradeModal } from './UpgradeModal';

interface TierGateProps {
  requiredTier: 'PRO' | 'ENTERPRISE';
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TierGate: React.FC<TierGateProps> = ({
  requiredTier,
  feature,
  children,
  fallback
}) => {
  const { user } = useUser();
  
  // Get user's current tier from metadata or database
  const currentTier = user?.publicMetadata?.tier as string || 'FREE';
  
  // Check if user has access
  const hasAccess = checkTierAccess(currentTier, requiredTier);
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <UpgradeModal
        feature={feature}
        requiredTier={requiredTier}
        currentTier={currentTier}
      />
    );
  }
  
  return <>{children}</>;
};

// Helper function to check tier access
function checkTierAccess(currentTier: string, requiredTier: string): boolean {
  const tierHierarchy = {
    'FREE': 0,
    'PRO': 1,
    'ENTERPRISE': 2
  };
  
  const currentLevel = tierHierarchy[currentTier as keyof typeof tierHierarchy] || 0;
  const requiredLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0;
  
  return currentLevel >= requiredLevel;
}

// Session counter component
interface SessionCounterProps {
  sessionsUsed: number;
  sessionLimit: number;
  tier: string;
}

export const SessionCounter: React.FC<SessionCounterProps> = ({
  sessionsUsed,
  sessionLimit,
  tier
}) => {
  const percentage = sessionLimit > 0 ? (sessionsUsed / sessionLimit) * 100 : 0;
  const isNearLimit = percentage > 80;
  const isAtLimit = sessionsUsed >= sessionLimit;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-700">
          Sessions: {sessionsUsed} / {sessionLimit === 0 ? '∞' : sessionLimit}
        </div>
        {sessionLimit > 0 && (
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit 
                  ? 'bg-red-500' 
                  : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </div>
      
      {isAtLimit && (
        <div className="text-xs text-red-600 font-medium">
          Limit reached
        </div>
      )}
      
      {isNearLimit && !isAtLimit && (
        <div className="text-xs text-yellow-600 font-medium">
          Near limit
        </div>
      )}
    </div>
  );
};

// Tier badge component
interface TierBadgeProps {
  tier: string;
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '' }) => {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return {
          label: 'Free',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '🆓'
        };
      case 'PRO':
        return {
          label: 'Pro',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '⭐'
        };
      case 'ENTERPRISE':
        return {
          label: 'Enterprise',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '👑'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓'
        };
    }
  };
  
  const config = getTierConfig(tier);
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${config.color} ${className}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};
