'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width, height, className = '', rounded = true }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: rounded ? '4px' : '0',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s ease-in-out infinite'
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Skeleton width="60%" height="1.5rem" className="mb-4" />
      <Skeleton width="40%" height="2rem" className="mb-2" />
      <Skeleton width="80%" height="0.875rem" />
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Skeleton width="50%" height="1rem" className="mb-4" />
      <Skeleton width="30%" height="3rem" className="mb-4" />
      <Skeleton width="100%" height="0.5rem" className="mb-2" />
      <Skeleton width="70%" height="0.875rem" />
    </div>
  );
}
