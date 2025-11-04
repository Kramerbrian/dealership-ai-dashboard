'use client';

import React from 'react';

/**
 * Loading skeleton for dashboard
 * Provides visual feedback during data loading
 */
export function DashboardSkeleton() {
  return (
    <div className="container">
      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header Skeleton */}
      <div className="header skeleton" style={{ height: 80, marginBottom: 20, borderRadius: 8 }} />

      {/* Tabs Skeleton */}
      <div className="skeleton" style={{ height: 60, marginBottom: 20, borderRadius: 8 }} />

      {/* Cards Grid Skeleton */}
      <div className="grid grid-3 mb-20">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="card skeleton"
            style={{
              height: 200,
              borderRadius: 8,
            }}
          />
        ))}
      </div>

      {/* Summary Metrics Skeleton */}
      <div className="grid grid-4 mb-20">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card skeleton"
            style={{
              height: 150,
              borderRadius: 8,
            }}
          />
        ))}
      </div>

      {/* Widgets Skeleton */}
      <div className="grid grid-2 mb-20">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="card skeleton"
            style={{
              height: 300,
              borderRadius: 8,
            }}
          />
        ))}
      </div>
    </div>
  );
}

