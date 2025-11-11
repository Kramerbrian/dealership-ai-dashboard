/**
 * Tier Gate Component
 * Controls access to features based on subscription tier
 */

import React from 'react';
import { DealershipTier } from '@prisma/client';
import { UpgradeModal } from './upgrade-modal';

interface TierGateProps {
  requiredTier: DealershipTier;
  feature: string;
  children: React.ReactNode;
  currentTier?: DealershipTier;
  onUpgrade?: () => void;
}

export function TierGate({
  requiredTier,
  feature,
  children,
  currentTier = 'FREE',
  onUpgrade
}: TierGateProps) {
  const hasAccess = checkTierAccess(currentTier, requiredTier);
  
  if (!hasAccess) {
    return (
      <UpgradeModal
        feature={feature}
        requiredTier={requiredTier}
        currentTier={currentTier}
        onUpgrade={onUpgrade}
      />
    );
  }
  
  return <>{children}</>;
}

function checkTierAccess(
  userTier: DealershipTier,
  requiredTier: DealershipTier
): boolean {
  const tierHierarchy = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2
  };
  
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

export function TierGateWrapper({
  requiredTier,
  feature,
  children,
  fallback
}: {
  requiredTier: DealershipTier;
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // This would be connected to actual user context
  const currentTier = 'FREE'; // Mock - replace with real user context
  
  if (!checkTierAccess(currentTier, requiredTier)) {
    return fallback || (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {feature} requires {requiredTier} tier
        </h3>
        <p className="text-gray-600 mb-4">
          Upgrade to access this feature and unlock more capabilities.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Upgrade Now
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
}
