/**
 * DealershipAI v2.0 - Session Counter Component
 * Displays session usage and limits for each tier
 */

import React, { useState, useEffect } from 'react';
import { TierManager } from '@/lib/tier-manager';

interface SessionCounterProps {
  userId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  className?: string;
  showUpgrade?: boolean;
}

interface SessionData {
  sessionsUsed: number;
  sessionsRemaining: number;
  monthlyCost: number;
  tierInfo: any;
}

export function SessionCounter({ 
  userId, 
  plan, 
  className = '',
  showUpgrade = true 
}: SessionCounterProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionData();
  }, [userId, plan]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tier?userId=${userId}&plan=${plan}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch session data');
      }
      
      const data = await response.json();
      setSessionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        Error loading session data
      </div>
    );
  }

  const { sessionsUsed, sessionsRemaining, monthlyCost, tierInfo } = sessionData;
  const usagePercent = tierInfo.sessionLimit > 0 ? (sessionsUsed / tierInfo.sessionLimit) * 100 : 0;
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = sessionsRemaining === 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Session Usage */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Sessions</span>
        <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-900'}`}>
          {sessionsUsed} / {tierInfo.sessionLimit === 0 ? '∞' : tierInfo.sessionLimit}
        </span>
      </div>

      {/* Progress Bar */}
      {tierInfo.sessionLimit > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit 
                ? 'bg-red-500' 
                : isNearLimit 
                ? 'bg-yellow-500' 
                : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      )}

      {/* Monthly Cost */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Monthly Cost</span>
        <span>${monthlyCost.toFixed(2)}</span>
      </div>

      {/* Status Message */}
      {isAtLimit && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          Session limit reached. Upgrade for more sessions.
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          {sessionsRemaining} sessions remaining
        </div>
      )}

      {/* Upgrade Button */}
      {showUpgrade && (isAtLimit || isNearLimit) && (
        <button
          onClick={() => window.open('/pricing', '_blank')}
          className="w-full text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Upgrade Plan
        </button>
      )}

      {/* Free Tier Message */}
      {plan === 'FREE' && (
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          Upgrade to unlock unlimited analysis
        </div>
      )}
    </div>
  );
}

// Compact version for headers
export function SessionCounterCompact({ 
  userId, 
  plan, 
  className = '' 
}: SessionCounterProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, [userId, plan]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/tier?userId=${userId}&plan=${plan}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (err) {
      // Silent fail for compact version
    } finally {
      setLoading(false);
    }
  };

  if (loading || !sessionData) {
    return (
      <div className={`animate-pulse h-4 bg-gray-200 rounded w-20 ${className}`} />
    );
  }

  const { sessionsUsed, sessionsRemaining, tierInfo } = sessionData;
  const isAtLimit = sessionsRemaining === 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : 'text-gray-700'}`}>
        {sessionsUsed}/{tierInfo.sessionLimit === 0 ? '∞' : tierInfo.sessionLimit}
      </div>
      {isAtLimit && (
        <button
          onClick={() => window.open('/pricing', '_blank')}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
        >
          Upgrade
        </button>
      )}
    </div>
  );
}

// Tier Badge Component
export function TierBadge({ 
  plan, 
  className = '' 
}: { 
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  className?: string;
}) {
  const tierInfo = TierManager.getTierInfo(plan);
  
  const colorClasses = {
    FREE: 'bg-gray-100 text-gray-800',
    PRO: 'bg-blue-100 text-blue-800',
    ENTERPRISE: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[plan]} ${className}`}>
      {tierInfo.name}
    </span>
  );
}