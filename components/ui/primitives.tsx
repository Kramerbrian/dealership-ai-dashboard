/**
 * Reusable UI Primitives
 * Reduces repetition by ~20% across landing pages and dashboard
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Container primitive
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

export function Container({ 
  className, 
  maxWidth = '7xl',
  children,
  ...props 
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div 
      className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Card primitive
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hover?: boolean;
}

export function Card({ 
  className, 
  variant = 'default',
  hover = false,
  children,
  ...props 
}: CardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-900/5',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        variantClasses[variant],
        hover && 'hover:shadow-md hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Button primitive
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg ring-1 ring-blue-500/20',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outline: 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Badge primitive
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ListCheck primitive (for bullet lists with checkmarks)
interface ListCheckProps {
  items: string[];
  className?: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

export function ListCheck({ 
  items, 
  className,
  icon,
  iconColor = 'text-emerald-600'
}: ListCheckProps) {
  const IconComponent = icon || CheckCircle;

  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          {typeof IconComponent === 'function' ? (
            <IconComponent className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
          ) : (
            <span className={cn('flex-shrink-0', iconColor)}>{icon || '✔'}</span>
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Export all as default object for convenience
export const Primitives = {
  Container,
  Card,
  Button,
  Badge,
  ListCheck,
};

