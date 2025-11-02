'use client';

import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-700 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-800 rounded" />
        <div className="h-8 w-8 bg-gray-800 rounded-full" />
      </div>
      <div className="h-12 w-32 bg-gray-800 rounded mb-2" />
      <div className="h-8 w-full bg-gray-800 rounded" />
    </div>
  );
};
