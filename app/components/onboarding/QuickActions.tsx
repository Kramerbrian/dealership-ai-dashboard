'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Settings, 
  RefreshCw, 
  Download, 
  Share2, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => Promise<void>;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
}

interface QuickActionsProps {
  onSettingsClick?: () => void;
  onRefreshClick?: () => void;
  onExportClick?: () => void;
  onShareClick?: () => void;
  onHelpClick?: () => void;
  onQuickSetupClick?: () => void;
}

export default function QuickActions({
  onSettingsClick,
  onRefreshClick,
  onExportClick,
  onShareClick,
  onHelpClick,
  onQuickSetupClick
}: QuickActionsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});

  const handleAction = async (actionId: string, action: () => Promise<void>) => {
    setLoadingStates(prev => ({ ...prev, [actionId]: true }));
    setErrorStates(prev => ({ ...prev, [actionId]: '' }));
    
    try {
      await action();
      setSuccessStates(prev => ({ ...prev, [actionId]: true }));
      
      // Clear success state after 2 seconds
      setTimeout(() => {
        setSuccessStates(prev => ({ ...prev, [actionId]: false }));
      }, 2000);
    } catch (error) {
      setErrorStates(prev => ({ 
        ...prev, 
        [actionId]: error instanceof Error ? error.message : 'An error occurred'
      }));
      
      // Clear error state after 5 seconds
      setTimeout(() => {
        setErrorStates(prev => ({ ...prev, [actionId]: '' }));
      }, 5000);
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'quick-setup',
      label: 'Quick Setup',
      icon: <Zap className="w-5 h-5" />,
      description: 'Skip detailed setup and get started quickly',
      action: async () => {
        if (onQuickSetupClick) {
          onQuickSetupClick();
        } else {
          // Default quick setup action
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.location.href = '/dash?quick=true';
        }
      },
      variant: 'primary'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configure your account and preferences',
      action: async () => {
        if (onSettingsClick) {
          onSettingsClick();
        } else {
          // Default settings action
          await new Promise(resolve => setTimeout(resolve, 500));
          // Open settings panel
        }
      },
      variant: 'secondary'
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <RefreshCw className="w-5 h-5" />,
      description: 'Update your integration data',
      action: async () => {
        if (onRefreshClick) {
          onRefreshClick();
        } else {
          // Default refresh action
          await new Promise(resolve => setTimeout(resolve, 2000));
          // Simulate data refresh
        }
      },
      variant: 'secondary'
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: <Download className="w-5 h-5" />,
      description: 'Download your setup data',
      action: async () => {
        if (onExportClick) {
          onExportClick();
        } else {
          // Default export action
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Simulate data export
          const data = {
            timestamp: new Date().toISOString(),
            integrations: ['website', 'google-analytics', 'facebook'],
            status: 'completed'
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'onboarding-data.json';
          a.click();
          URL.revokeObjectURL(url);
        }
      },
      variant: 'secondary'
    },
    {
      id: 'share',
      label: 'Share Progress',
      icon: <Share2 className="w-5 h-5" />,
      description: 'Share your setup progress',
      action: async () => {
        if (onShareClick) {
          onShareClick();
        } else {
          // Default share action
          await new Promise(resolve => setTimeout(resolve, 800));
          if (navigator.share) {
            await navigator.share({
              title: 'DealershipAI Setup Progress',
              text: 'I just completed my DealershipAI onboarding setup!',
              url: window.location.href
            });
          } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(window.location.href);
            // Show success message
          }
        }
      },
      variant: 'secondary'
    },
    {
      id: 'help',
      label: 'Get Help',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Get assistance with setup',
      action: async () => {
        if (onHelpClick) {
          onHelpClick();
        } else {
          // Default help action
          await new Promise(resolve => setTimeout(resolve, 500));
          // Open help system
        }
      },
      variant: 'secondary'
    }
  ];

  const getVariantStyles = (variant: string, isLoading: boolean, isSuccess: boolean, hasError: boolean) => {
    if (isLoading) {
      return 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]';
    }
    
    if (isSuccess) {
      return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    }
    
    if (hasError) {
      return 'bg-red-500/20 border-red-500/30 text-red-400';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/30';
      case 'success':
        return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30';
      default:
        return 'bg-white/10 border-white/20 text-white hover:bg-white/20';
    }
  };

  const getIcon = (action: QuickAction, isLoading: boolean, isSuccess: boolean, hasError: boolean) => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    
    if (isSuccess) {
      return <CheckCircle2 className="w-5 h-5" />;
    }
    
    if (hasError) {
      return <AlertCircle className="w-5 h-5" />;
    }
    
    return action.icon;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const isLoading = loadingStates[action.id];
          const isSuccess = successStates[action.id];
          const hasError = !!errorStates[action.id];
          const errorMessage = errorStates[action.id];
          
          return (
            <div key={action.id} className="space-y-2">
              <button
                onClick={() => handleAction(action.id, action.action)}
                disabled={isLoading || action.disabled}
                className={`w-full p-3 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles(action.variant, isLoading, isSuccess, hasError)}`}
              >
                <div className="flex items-center gap-2">
                  {getIcon(action, isLoading, isSuccess, hasError)}
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </button>
              
              <p className="text-xs text-white/60 text-center">
                {action.description}
              </p>
              
              {hasError && (
                <div className="text-xs text-red-400 text-center bg-red-500/10 rounded p-2">
                  {errorMessage}
                </div>
              )}
              
              {isSuccess && (
                <div className="text-xs text-emerald-400 text-center bg-emerald-500/10 rounded p-2">
                  Success!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
