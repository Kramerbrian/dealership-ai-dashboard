// @ts-nocheck
'use client';

import { Inbox, Search, FileText, Users, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  variant?: 'default' | 'search' | 'data' | 'error';
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  const variantIcons = {
    default: <Inbox className="w-12 h-12" />,
    search: <Search className="w-12 h-12" />,
    data: <FileText className="w-12 h-12" />,
    error: <AlertCircle className="w-12 h-12" />
  };

  const variantColors = {
    default: 'text-gray-600',
    search: 'text-blue-600',
    data: 'text-purple-600',
    error: 'text-red-600'
  };

  const displayIcon = icon || variantIcons[variant];
  const iconColor = variantColors[variant];

  const ActionButton = action?.href ? Link : 'button';
  const SecondaryButton = secondaryAction?.href ? Link : 'button';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
      {/* Icon */}
      <div className={`w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 ${iconColor}`}>
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-400 mb-8 max-w-md leading-relaxed">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <ActionButton
              {...(action.href ? { href: action.href } : {})}
              {...(action.onClick ? { onClick: action.onClick } : {})}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              {action.label}
            </ActionButton>
          )}

          {secondaryAction && (
            <SecondaryButton
              {...(secondaryAction.href ? { href: secondaryAction.href } : {})}
              {...(secondaryAction.onClick ? { onClick: secondaryAction.onClick } : {})}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
            >
              {secondaryAction.label}
              <ArrowRight className="w-5 h-5" />
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-built variants for common use cases
export function NoDashboardData() {
  return (
    <EmptyState
      variant="data"
      title="No data yet"
      description="Start by connecting your dealership website to begin tracking your AI visibility metrics."
      action={{
        label: 'Connect Website',
        href: '/onboarding'
      }}
      secondaryAction={{
        label: 'Learn More',
        href: '/docs'
      }}
    />
  );
}

export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={query ? `We couldn't find anything matching "${query}". Try adjusting your search.` : 'Try adjusting your search criteria.'}
      action={{
        label: 'Clear Search',
        onClick: () => window.location.reload()
      }}
    />
  );
}

export function NoReportsYet() {
  return (
    <EmptyState
      variant="data"
      icon={<FileText className="w-12 h-12" />}
      title="No reports generated yet"
      description="Generate your first AI visibility report to see how your dealership ranks on ChatGPT and other AI search engines."
      action={{
        label: 'Generate Report',
        href: '/dashboard'
      }}
    />
  );
}

export function NoTeamMembers() {
  return (
    <EmptyState
      variant="default"
      icon={<Users className="w-12 h-12" />}
      title="No team members yet"
      description="Invite your team to collaborate on improving your dealership's AI visibility."
      action={{
        label: 'Invite Team Member',
        href: '/settings/team'
      }}
    />
  );
}

export function ErrorLoadingData({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Failed to load data"
      description="We couldn't load your data. Please check your connection and try again."
      action={{
        label: 'Try Again',
        onClick: onRetry || (() => window.location.reload())
      }}
      secondaryAction={{
        label: 'Contact Support',
        href: '/support'
      }}
    />
  );
}
