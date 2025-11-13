'use client';
import { useState } from 'react';
import PermissionsInspector from './PermissionsInspector';

interface FeatureButtonProps {
  feature: string;
  action: string;
  userRole: 'viewer' | 'editor' | 'admin' | 'dealer_user';
  userPlan: 'starter' | 'growth' | 'professional';
  userFeatures: string[];
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function FeatureButton({
  feature,
  action,
  userRole,
  userPlan,
  userFeatures,
  children,
  onClick,
  className = '',
  disabled = false
}: FeatureButtonProps) {
  const [loading, setLoading] = useState(false);

  // Check if feature is available
  const isFeatureAvailable = userFeatures.includes(feature);
  const hasPermission = userRole === 'admin' || 
                       (userRole === 'editor' && action !== 'admin') ||
                       (userRole === 'viewer' && action === 'view');
  
  const isDisabled = disabled || !isFeatureAvailable || !hasPermission;

  const handleClick = async () => {
    if (isDisabled) return;
    
    setLoading(true);
    try {
      if (onClick) {
        await onClick();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleClick}
        disabled={isDisabled || loading}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${isDisabled || loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
          ${className}
        `}
      >
        {loading ? 'Loading...' : children}
      </button>
      
      {isDisabled && (
        <PermissionsInspector
          resource={feature}
          action={action}
          role={userRole}
          plan={userPlan}
          features={userFeatures}
        />
      )}
    </div>
  );
}

// Example usage component
export function FeatureButtonExamples() {
  const [userRole] = useState<'viewer' | 'editor' | 'admin' | 'dealer_user'>('viewer');
  const [userPlan] = useState<'starter' | 'growth' | 'professional'>('starter');
  const [userFeatures] = useState<string[]>(['view']);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Feature Button Examples</h3>
      
      <div className="space-y-3">
        <FeatureButton
          feature="analytics.advanced"
          action="view"
          userRole={userRole}
          userPlan={userPlan}
          userFeatures={userFeatures}
          onClick={() => console.log('Viewing advanced analytics')}
        >
          View Advanced Analytics
        </FeatureButton>

        <FeatureButton
          feature="export.csv"
          action="export"
          userRole={userRole}
          userPlan={userPlan}
          userFeatures={userFeatures}
          onClick={() => console.log('Exporting CSV')}
        >
          Export CSV Report
        </FeatureButton>

        <FeatureButton
          feature="admin.settings"
          action="admin"
          userRole={userRole}
          userPlan={userPlan}
          userFeatures={userFeatures}
          onClick={() => console.log('Admin settings')}
        >
          Admin Settings
        </FeatureButton>

        <FeatureButton
          feature="audit.advanced"
          action="run"
          userRole={userRole}
          userPlan={userPlan}
          userFeatures={userFeatures}
          onClick={() => console.log('Running advanced audit')}
        >
          Run Advanced Audit
        </FeatureButton>
      </div>
    </div>
  );
}
