'use client';

interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'table' | 'chart';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
  animated?: boolean;
}

export default function LoadingSkeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  className = '', 
  lines = 1,
  animated = true 
}: LoadingSkeletonProps) {
  const baseClasses = `bg-gray-200 ${animated ? 'animate-pulse' : ''}`;
  
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
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{
              ...getDimensions(),
              width: index === lines - 1 ? '75%' : width || '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getDimensions()}
    />
  );
}

// Pre-built skeleton components for common use cases
export function KPISkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <LoadingSkeleton variant="text" width="60%" className="mb-2" />
      <LoadingSkeleton variant="text" width="40%" height="32px" className="mb-1" />
      <LoadingSkeleton variant="text" width="80%" height="12px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <LoadingSkeleton key={index} variant="table" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <LoadingSkeleton variant="text" width="40%" className="mb-4" />
      <LoadingSkeleton variant="chart" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
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
