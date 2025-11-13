/**
 * TierGate Component
 * Controls access to features based on user tier
 */

'use client';

import React from 'react';
import { PlanTier, ClientTierManager } from '@/lib/tier-manager-client';
import { Lock, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TierGateProps {
  children: React.ReactNode;
  requiredTier: PlanTier;
  currentTier: PlanTier;
  feature: string;
  showUpgrade?: boolean;
  className?: string;
}

const TIER_ICONS = {
  FREE: Lock,
  PRO: Zap,
  ENTERPRISE: Crown
};

const TIER_COLORS = {
  FREE: 'text-gray-500',
  PRO: 'text-blue-500',
  ENTERPRISE: 'text-purple-500'
};

const TIER_GRADIENTS = {
  FREE: 'from-gray-50 to-gray-100',
  PRO: 'from-blue-50 to-blue-100',
  ENTERPRISE: 'from-purple-50 to-purple-100'
};

export function TierGate({ 
  children, 
  requiredTier, 
  currentTier, 
  feature,
  showUpgrade = true,
  className = ''
}: TierGateProps) {
  const hasAccess = ClientTierManager.hasTierAccess(currentTier, requiredTier);
  
  if (hasAccess) {
    return <>{children}</>;
  }

  const Icon = TIER_ICONS[requiredTier];
  const colorClass = TIER_COLORS[requiredTier];
  const gradientClass = TIER_GRADIENTS[requiredTier];

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className={`w-full max-w-md bg-gradient-to-br ${gradientClass} border-2 border-dashed border-gray-300`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
              <Icon className={`w-8 h-8 ${colorClass}`} />
            </div>
            <CardTitle className="text-xl font-bold">
              {requiredTier} Feature
            </CardTitle>
            <CardDescription>
              {ClientTierManager.getFeatureDescription(feature, requiredTier)}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              Your current plan: <span className="font-semibold">{currentTier}</span>
            </div>
            
            {showUpgrade && (
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => handleUpgrade(requiredTier)}
                >
                  Upgrade to {requiredTier}
                </Button>
                
                <div className="text-xs text-gray-500">
                  {ClientTierManager.getUpgradeBenefits(requiredTier)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


/**
 * Handle upgrade action
 */
function handleUpgrade(requiredTier: PlanTier) {
  // Redirect to pricing page with upgrade focus
  window.location.href = `/pricing?upgrade=${requiredTier}`;
}

/**
 * Tier Badge Component
 */
interface TierBadgeProps {
  tier: PlanTier;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const Icon = TIER_ICONS[tier];
  const colorClass = TIER_COLORS[tier];
  const gradientClass = TIER_GRADIENTS[tier];
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradientClass} border ${className}`}>
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <span className={`text-sm font-medium ${colorClass}`}>
        {tier}
      </span>
    </div>
  );
}

/**
 * Session Counter Component
 */
interface SessionCounterProps {
  sessionsUsed: number;
  sessionsLimit: number;
  tier: PlanTier;
  className?: string;
}

export function SessionCounter({ 
  sessionsUsed, 
  sessionsLimit, 
  tier,
  className = '' 
}: SessionCounterProps) {
  const percentage = sessionsLimit > 0 ? (sessionsUsed / sessionsLimit) * 100 : 0;
  const isNearLimit = percentage > 80;
  const isAtLimit = sessionsUsed >= sessionsLimit;
  
  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-500';
    if (isNearLimit) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getStatusText = () => {
    if (isAtLimit) return 'Session limit reached';
    if (isNearLimit) return 'Sessions running low';
    return 'Sessions available';
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-current" />
        <span className="text-sm font-medium">
          {sessionsUsed} / {sessionsLimit}
        </span>
        <span className="text-xs text-gray-500">sessions</span>
      </div>
      
      {sessionsLimit > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      )}
      
      {isAtLimit && (
        <Button size="sm" variant="outline" className="text-xs">
          Upgrade
        </Button>
      )}
    </div>
  );
}
