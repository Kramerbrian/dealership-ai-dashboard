"use client";

/**
 * Stripe Gate Component
 * 
 * Shows upgrade prompt when feature is locked
 */

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserPlan, hasFeatureAccess, getUpsellMessage, PlanTier, checkUsageLimit } from '@/lib/stripe/gating';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface StripeGateProps {
  feature: 'autopilot' | 'advanced_analytics' | 'analyses' | 'competitors' | 'pulses';
  children: React.ReactNode;
  showUpgrade?: boolean;
  className?: string;
}

export function StripeGate({ feature, children, showUpgrade = true, className = '' }: StripeGateProps) {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="animate-pulse bg-gray-100 rounded-lg h-20" />;
  }

  const plan = getUserPlan(user);
  const hasAccess = hasFeatureAccess(user, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  const upsell = getUpsellMessage(feature, plan);

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none opacity-50">
        {children}
      </div>

      {/* Overlay with upgrade prompt */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-6 max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Feature Locked
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {upsell.message}
          </p>

          {showUpgrade && (
            <Link
              href={upsell.link}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              {upsell.cta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Usage Badge - Shows current usage vs limit
 */
interface UsageBadgeProps {
  feature: 'analyses' | 'competitors' | 'pulses';
  currentUsage: number;
  className?: string;
}

export function UsageBadge({ feature, currentUsage, className = '' }: UsageBadgeProps) {
  const { user } = useUser();
  const plan = getUserPlan(user);
  
  const { remaining, limit, allowed } = checkUsageLimit(user, feature, currentUsage);
  const percentage = limit === Infinity ? 0 : (currentUsage / limit) * 100;
  const isWarning = percentage >= 90;
  const isCritical = percentage >= 100;

  if (limit === Infinity) {
    return null; // Enterprise, no badge needed
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
      isCritical ? 'bg-red-100 text-red-700' :
      isWarning ? 'bg-amber-100 text-amber-700' :
      'bg-blue-100 text-blue-700'
    } ${className}`}>
      <span>
        {currentUsage} / {limit} {feature}
      </span>
      {isWarning && (
        <Link
          href="/pricing"
          className="underline hover:no-underline"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}

