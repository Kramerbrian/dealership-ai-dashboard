/**
 * DealershipAI v2.0 - Tier Gate Component
 * Controls access to features based on user tier
 */

import React from 'react';
import { TierManager } from '@/lib/tier-manager';

interface TierGateProps {
  children: React.ReactNode;
  requiredTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  currentTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function TierGate({ 
  children, 
  requiredTier, 
  currentTier, 
  fallback,
  showUpgrade = true 
}: TierGateProps) {
  // Check if user has access to the feature
  const hasAccess = TierManager.hasFeatureAccess(currentTier, requiredTier);
  
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return <UpgradePrompt requiredTier={requiredTier} currentTier={currentTier} />;
}

interface UpgradePromptProps {
  requiredTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  currentTier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

function UpgradePrompt({ requiredTier, currentTier }: UpgradePromptProps) {
  const tierInfo = TierManager.getTierInfo(requiredTier);
  const nextTier = TierManager.getNextTier(currentTier);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {tierInfo.name} Required
      </h3>
      
      <p className="text-gray-600 mb-4">
        This feature is available with the {tierInfo.name} plan. 
        Upgrade to unlock advanced analytics and insights.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.open('/pricing', '_blank')}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upgrade to {tierInfo.name}
        </button>
        
        <button
          onClick={() => window.open('/demo', '_blank')}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Demo
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Current plan: {TierManager.getTierInfo(currentTier).name}
      </div>
    </div>
  );
}

// Convenience components for specific tiers
export function ProGate({ children, currentTier, ...props }: Omit<TierGateProps, 'requiredTier'>) {
  return (
    <TierGate requiredTier="PRO" currentTier={currentTier} {...props}>
      {children}
    </TierGate>
  );
}

export function EnterpriseGate({ children, currentTier, ...props }: Omit<TierGateProps, 'requiredTier'>) {
  return (
    <TierGate requiredTier="ENTERPRISE" currentTier={currentTier} {...props}>
      {children}
    </TierGate>
  );
}

// Feature-specific gates
export function EEATGate({ children, currentTier, ...props }: Omit<TierGateProps, 'requiredTier'>) {
  return (
    <TierGate requiredTier="PRO" currentTier={currentTier} {...props}>
      {children}
    </TierGate>
  );
}

export function MysteryShopGate({ children, currentTier, ...props }: Omit<TierGateProps, 'requiredTier'>) {
  return (
    <TierGate requiredTier="ENTERPRISE" currentTier={currentTier} {...props}>
      {children}
    </TierGate>
  );
}