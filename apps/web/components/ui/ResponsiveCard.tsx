'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Maximize2, Minimize2, MoreHorizontal } from 'lucide-react';

interface ResponsiveCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  expandable?: boolean;
  actions?: React.ReactNode;
  defaultExpanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export default function ResponsiveCard({
  title,
  subtitle,
  icon,
  children,
  className = '',
  collapsible = false,
  expandable = false,
  actions,
  defaultExpanded = true,
  onExpand,
  onCollapse
}: ResponsiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
      if (isExpanded) {
        onCollapse?.();
      } else {
        onExpand?.();
      }
    }
  };

  const handleFullscreen = () => {
    if (expandable) {
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <motion.div
      layout
      className={`glass-card transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-4 z-50 p-6' 
          : 'p-4 md:p-6'
      } ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
            {subtitle && (
              <p className="text-sm text-white/60 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          
          {expandable && (
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
          )}

          {collapsible && (
            <button
              onClick={handleToggle}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </motion.div>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Touch Indicators */}
      <div className="md:hidden mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile-optimized button component
export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = 'touch-manipulation select-none transition-all duration-200 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    ghost: 'text-white/80 hover:text-white hover:bg-white/10'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg min-h-[44px]',
    md: 'px-4 py-3 text-base rounded-lg min-h-[48px]',
    lg: 'px-6 py-4 text-lg rounded-xl min-h-[52px]'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Swipeable container for mobile
export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    setIsDragging(false);
    setCurrentX(0);
  };

  return (
    <div
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isDragging ? `translateX(${currentX - startX}px)` : 'translateX(0)',
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {children}
    </div>
  );
}
