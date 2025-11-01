'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CupertinoWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onTap?: () => void;
  loading?: boolean;
  className?: string;
}

export default function CupertinoWidget({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'blue',
  size = 'medium',
  interactive = false,
  onTap,
  loading = false,
  className = ''
}: CupertinoWidgetProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      text: 'text-blue-600',
      textLight: 'text-blue-500',
      border: 'border-blue-200',
      shadow: 'shadow-blue-100'
    },
    green: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-50',
      text: 'text-green-600',
      textLight: 'text-green-500',
      border: 'border-green-200',
      shadow: 'shadow-green-100'
    },
    orange: {
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      text: 'text-orange-600',
      textLight: 'text-orange-500',
      border: 'border-orange-200',
      shadow: 'shadow-orange-100'
    },
    purple: {
      bg: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      text: 'text-purple-600',
      textLight: 'text-purple-500',
      border: 'border-purple-200',
      shadow: 'shadow-purple-100'
    },
    red: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-50',
      text: 'text-red-600',
      textLight: 'text-red-500',
      border: 'border-red-200',
      shadow: 'shadow-red-100'
    },
    gray: {
      bg: 'bg-gray-500',
      bgLight: 'bg-gray-50',
      text: 'text-gray-600',
      textLight: 'text-gray-500',
      border: 'border-gray-200',
      shadow: 'shadow-gray-100'
    }
  };

  const sizeClasses = {
    small: 'p-3 min-h-[80px]',
    medium: 'p-4 min-h-[100px]',
    large: 'p-6 min-h-[120px]'
  };

  const textSizeClasses = {
    small: {
      title: 'text-xs',
      value: 'text-lg',
      subtitle: 'text-xs'
    },
    medium: {
      title: 'text-sm',
      value: 'text-2xl',
      subtitle: 'text-xs'
    },
    large: {
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-sm'
    }
  };

  const currentColor = colorClasses[color];
  const currentSize = sizeClasses[size];
  const currentTextSize = textSizeClasses[size];

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'stable':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleInteraction = () => {
    if (interactive && onTap) {
      onTap();
    }
  };

  if (loading) {
    return (
      <div className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 ${currentSize} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`
        relative rounded-3xl bg-white/80 backdrop-blur-xl 
        border border-gray-200/50 shadow-lg shadow-gray-100/50
        ${currentSize} ${className}
        ${interactive ? 'cursor-pointer' : ''}
        ${isHovered && interactive ? 'shadow-xl shadow-gray-200/50' : ''}
        ${isPressed ? 'scale-95' : 'scale-100'}
        transition-all duration-200 ease-out
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleInteraction}
      whileHover={interactive ? { scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div className={`w-8 h-8 rounded-2xl ${currentColor.bgLight} flex items-center justify-center`}>
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <h3 className={`${currentTextSize.title} font-medium text-gray-700 leading-tight`}>
              {title}
            </h3>
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              <span className="text-sm font-medium">{getTrendIcon()}</span>
              {trendValue && (
                <span className="text-xs font-medium">{trendValue}</span>
              )}
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="flex-1 flex items-center">
          <motion.div
            className={`${currentTextSize.value} font-bold text-gray-900 tabular-nums`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {value}
          </motion.div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className={`${currentTextSize.subtitle} text-gray-500 leading-tight`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Interactive feedback */}
      <AnimatePresence>
        {interactive && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-3xl border border-white/50 pointer-events-none" />
    </motion.div>
  );
}

// Pre-built widget variants for common use cases
export function CupertinoKPICard({
  title,
  value,
  trend,
  trendValue,
  subtitle,
  color = 'blue',
  onTap
}: {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  onTap?: () => void;
}) {
  return (
    <CupertinoWidget
      title={title}
      value={value}
      trend={trend}
      trendValue={trendValue}
      subtitle={subtitle}
      color={color}
      size="medium"
      interactive={!!onTap}
      onTap={onTap}
    />
  );
}

export function CupertinoMetricCard({
  title,
  value,
  icon,
  color = 'blue',
  onTap
}: {
  title: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  onTap?: () => void;
}) {
  return (
    <CupertinoWidget
      title={title}
      value={value}
      icon={icon}
      color={color}
      size="small"
      interactive={!!onTap}
      onTap={onTap}
    />
  );
}

export function CupertinoHeroCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  onTap
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  onTap?: () => void;
}) {
  return (
    <CupertinoWidget
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      color={color}
      size="large"
      interactive={!!onTap}
      onTap={onTap}
    />
  );
}
