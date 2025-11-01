'use client';

import { useState, useEffect } from 'react';
import { Zap, Crown, Shield } from 'lucide-react';

interface SessionData {
  used: number;
  limit: number;
  tier: string;
  resetDate: string;
}

function SessionCounter() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, []);

  const fetchSessionData = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !sessionData) {
    return (
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  const { used, limit, tier, resetDate } = sessionData;
  const percentage = (used / limit) * 100;
  const remaining = limit - used;
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;

  const getTierIcon = () => {
    switch (tier) {
      case 'PRO':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'ENTERPRISE':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Zap className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'PRO':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'ENTERPRISE':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`
      mb-6 p-4 rounded-lg border transition-colors
      ${isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-white border-gray-200'
      }
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getTierIcon()}
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              AI Analysis Sessions
            </h3>
            <p className="text-xs text-gray-500">
              {used} of {limit} used this month
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${isAtLimit 
                    ? 'bg-red-500' 
                    : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                  }
                `}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {Math.round(percentage)}%
            </span>
          </div>

          {/* Tier Badge */}
          <div className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
            ${getTierColor()}
          `}>
            {tier}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {isAtLimit && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Session limit reached!</strong> Upgrade to Pro or Enterprise to continue analyzing.
          </p>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Running low on sessions!</strong> You have {remaining} sessions remaining this month.
          </p>
        </div>
      )}

      {/* Reset Info */}
      <div className="mt-2 text-xs text-gray-500">
        Resets on {new Date(resetDate).toLocaleDateString()}
      </div>
    </div>
  );
}

export { SessionCounter };
