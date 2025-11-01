'use client';
import { ReactNode, useState } from 'react';

interface EnhancedCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

export default function EnhancedCard({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  size = 'md',
  hover = true,
  clickable = false,
  onClick,
  className = '',
  header,
  footer,
  loading = false
}: EnhancedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = 'rounded-2xl transition-all duration-200 relative overflow-hidden';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${hoverClasses}
        ${clickableClasses}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle || icon || header) && (
        <div className="mb-6">
          {header ? (
            header
          ) : (
            <div className="flex items-start space-x-3">
              {icon && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    {icon}
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          {footer}
        </div>
      )}

      {/* Hover effect overlay */}
      {isHovered && hover && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 pointer-events-none rounded-2xl"></div>
      )}
    </div>
  );
}

// Metric card variant
export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  subtitle,
  className = ''
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  className?: string;
}) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const trendIcons = {
    up: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
      </svg>
    ),
    stable: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    )
  };

  return (
    <EnhancedCard
      variant="elevated"
      size="md"
      className={`${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`p-2 rounded-lg ${changeColors[changeType]}`}>
            {trendIcons[trend]}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        {change && (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
            {change}
          </div>
        )}
      </div>
    </EnhancedCard>
  );
}

// Status card variant
export function StatusCard({
  title,
  status,
  description,
  icon,
  actions,
  className = ''
}: {
  title: string;
  status: 'success' | 'warning' | 'error' | 'info';
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  const statusIcons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <EnhancedCard
      variant="outlined"
      size="md"
      className={`border-l-4 ${statusColors[status]} ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${statusColors[status]}`}>
          {icon || statusIcons[status]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mb-3">
              {description}
            </p>
          )}
          {actions && (
            <div className="flex space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
}
