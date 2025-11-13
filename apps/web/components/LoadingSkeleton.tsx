/**
 * DealershipAI Site Intelligence - Loading Skeleton
 * 
 * Skeleton loading states for better UX
 */

'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  lines = 1
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 rounded h-4 mb-2 last:mb-0"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export const TileSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-border-soft bg-bg-glass backdrop-blur-glass p-4">
      <div className="animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
