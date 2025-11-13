'use client';

interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'table' | 'chart';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
  animated?: boolean;
  animation?: 'pulse' | 'shimmer';
}

export default function LoadingSkeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  lines = 1,
  animated = true,
  animation = 'shimmer'
}: LoadingSkeletonProps) {
  const baseClasses = `bg-gray-800/50 ${animated ? (animation === 'shimmer' ? 'skeleton' : 'animate-pulse') : ''}`;

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'h-32 rounded-2xl';
      case 'table':
        return 'h-12 rounded';
      case 'chart':
        return 'h-48 rounded-lg';
      default:
        return 'rounded';
    }
  };

  const getDimensions = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
        <span className="sr-only">Loading...</span>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{
              ...getDimensions(),
              width: index === lines - 1 ? '75%' : width || '100%'
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getDimensions()}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Pre-built skeleton components for common use cases
export function KPISkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 shadow-xl" role="status" aria-label="Loading metric">
      <span className="sr-only">Loading metric...</span>
      <LoadingSkeleton variant="text" width="60%" className="mb-2" />
      <LoadingSkeleton variant="text" width="40%" height="32px" className="mb-1" />
      <LoadingSkeleton variant="text" width="80%" height="12px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading table">
      <span className="sr-only">Loading table...</span>
      {Array.from({ length: rows }).map((_, index) => (
        <LoadingSkeleton key={index} variant="table" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 shadow-xl" role="status" aria-label="Loading chart">
      <span className="sr-only">Loading chart...</span>
      <LoadingSkeleton variant="text" width="40%" className="mb-4" />
      <LoadingSkeleton variant="chart" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 shadow-xl" role="status" aria-label="Loading card">
      <span className="sr-only">Loading card...</span>
      <div className="flex items-center justify-between mb-4">
        <LoadingSkeleton variant="text" width="30%" />
        <LoadingSkeleton variant="circular" width="24px" height="24px" />
      </div>
      <div className="space-y-3">
        <LoadingSkeleton variant="text" width="100%" />
        <LoadingSkeleton variant="text" width="80%" />
        <LoadingSkeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

// Dashboard-specific skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard...</span>

      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width="30%" height={32} />
        <LoadingSkeleton variant="text" width="50%" height={20} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <KPISkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
