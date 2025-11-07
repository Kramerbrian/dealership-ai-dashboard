'use client';

import { motion } from 'framer-motion';

interface ModalSkeletonProps {
  variant?: 'default' | 'chart' | 'table' | 'list';
  lines?: number;
}

export function ModalSkeleton({ variant = 'default', lines = 3 }: ModalSkeletonProps) {
  if (variant === 'chart') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        
        {/* Chart Area */}
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      
      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${100 - i * 10}%` }}></div>
      ))}
      
      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
}

interface ModalLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ModalLoadingSpinner({ message = 'Loading...', size = 'md' }: ModalLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}

