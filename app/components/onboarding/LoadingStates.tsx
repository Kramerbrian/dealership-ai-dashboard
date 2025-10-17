'use client';

import React from 'react';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  message?: string;
  successMessage?: string;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots' | 'skeleton';
}

export function LoadingState({
  isLoading,
  isSuccess = false,
  isError = false,
  message = 'Loading...',
  successMessage = 'Success!',
  errorMessage = 'An error occurred',
  size = 'md',
  variant = 'spinner'
}: LoadingStateProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getIcon = () => {
    if (isSuccess) {
      return <CheckCircle2 className={`${getSizeClasses()} text-emerald-400`} />;
    }
    
    if (isError) {
      return <AlertCircle className={`${getSizeClasses()} text-red-400`} />;
    }
    
    if (isLoading) {
      switch (variant) {
        case 'pulse':
          return <div className={`${getSizeClasses()} bg-[var(--brand-primary)] rounded-full animate-pulse`} />;
        case 'dots':
          return <DotsLoader size={size} />;
        case 'skeleton':
          return <SkeletonLoader />;
        default:
          return <Loader2 className={`${getSizeClasses()} text-[var(--brand-primary)] animate-spin`} />;
      }
    }
    
    return null;
  };

  const getMessage = () => {
    if (isSuccess) return successMessage;
    if (isError) return errorMessage;
    return message;
  };

  const getTextColor = () => {
    if (isSuccess) return 'text-emerald-400';
    if (isError) return 'text-red-400';
    return 'text-white/70';
  };

  return (
    <div className="flex items-center gap-3">
      {getIcon()}
      <span className={`text-sm ${getTextColor()}`}>
        {getMessage()}
      </span>
    </div>
  );
}

// Dots Loader Component
function DotsLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const getDotSize = () => {
    switch (size) {
      case 'sm':
        return 'w-1 h-1';
      case 'lg':
        return 'w-3 h-3';
      default:
        return 'w-2 h-2';
    }
  };

  return (
    <div className="flex space-x-1">
      <div className={`${getDotSize()} bg-[var(--brand-primary)] rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${getDotSize()} bg-[var(--brand-primary)] rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${getDotSize()} bg-[var(--brand-primary)] rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-white/10 rounded animate-pulse" />
      <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
    </div>
  );
}

// Button Loading State
interface ButtonLoadingStateProps {
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function ButtonLoadingState({
  isLoading,
  isSuccess = false,
  isError = false,
  children,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error',
  className = '',
  disabled = false,
  onClick
}: ButtonLoadingStateProps) {
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </>
      );
    }
    
    if (isSuccess) {
      return (
        <>
          <CheckCircle2 className="w-4 h-4" />
          {successText}
        </>
      );
    }
    
    if (isError) {
      return (
        <>
          <AlertCircle className="w-4 h-4" />
          {errorText}
        </>
      );
    }
    
    return children;
  };

  const getButtonStyles = () => {
    if (isSuccess) {
      return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    }
    
    if (isError) {
      return 'bg-red-500/20 border-red-500/30 text-red-400';
    }
    
    if (isLoading) {
      return 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]';
    }
    
    return 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/80 text-white';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()} ${className}`}
    >
      {getButtonContent()}
    </button>
  );
}

// Card Loading State
interface CardLoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonLines?: number;
}

export function CardLoadingState({
  isLoading,
  children,
  skeletonLines = 3
}: CardLoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/20">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-white/10 rounded animate-pulse" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-2/3" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-2">
          {Array.from({ length: skeletonLines }).map((_, i) => (
            <div
              key={i}
              className={`h-3 bg-white/10 rounded animate-pulse ${
                i === skeletonLines - 1 ? 'w-1/2' : 'w-full'
              }`}
            />
          ))}
        </div>
        
        {/* Button skeleton */}
        <div className="flex gap-3 pt-4">
          <div className="h-8 bg-white/10 rounded-lg animate-pulse w-20" />
          <div className="h-8 bg-white/10 rounded-lg animate-pulse w-24" />
        </div>
      </div>
    </div>
  );
}

// Progress Loading State
interface ProgressLoadingStateProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  showPercentage?: boolean;
}

export function ProgressLoadingState({
  isLoading,
  progress = 0,
  message = 'Processing...',
  showPercentage = true
}: ProgressLoadingStateProps) {
  if (!isLoading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{message}</span>
        {showPercentage && (
          <span className="text-sm text-white/70">{Math.round(progress)}%</span>
        )}
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Full Page Loading State
interface FullPageLoadingStateProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export function FullPageLoadingState({
  isLoading,
  message = 'Loading...',
  children
}: FullPageLoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-[var(--brand-background)] flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
        <p className="text-white/70 text-lg">{message}</p>
      </div>
    </div>
  );
}
