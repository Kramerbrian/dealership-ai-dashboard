'use client';

import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'purple' | 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  loading?: boolean;
  className?: string;
}

const colorClasses = {
  purple: {
    bg: 'from-purple-600/20 to-blue-600/20',
    border: 'border-purple-500/30',
    icon: 'bg-purple-500/20 text-purple-400',
    trend: {
      up: 'text-purple-400',
      down: 'text-red-400',
      stable: 'text-gray-400'
    }
  },
  green: {
    bg: 'from-green-600/20 to-cyan-600/20',
    border: 'border-green-500/30',
    icon: 'bg-green-500/20 text-green-400',
    trend: {
      up: 'text-green-400',
      down: 'text-red-400',
      stable: 'text-gray-400'
    }
  },
  blue: {
    bg: 'from-blue-600/20 to-purple-600/20',
    border: 'border-blue-500/30',
    icon: 'bg-blue-500/20 text-blue-400',
    trend: {
      up: 'text-blue-400',
      down: 'text-red-400',
      stable: 'text-gray-400'
    }
  },
  yellow: {
    bg: 'from-yellow-600/20 to-orange-600/20',
    border: 'border-yellow-500/30',
    icon: 'bg-yellow-500/20 text-yellow-400',
    trend: {
      up: 'text-yellow-400',
      down: 'text-red-400',
      stable: 'text-gray-400'
    }
  },
  red: {
    bg: 'from-red-600/20 to-pink-600/20',
    border: 'border-red-500/30',
    icon: 'bg-red-500/20 text-red-400',
    trend: {
      up: 'text-red-400',
      down: 'text-red-400',
      stable: 'text-gray-400'
    }
  },
  gray: {
    bg: 'from-gray-600/20 to-gray-700/20',
    border: 'border-gray-500/30',
    icon: 'bg-gray-500/20 text-gray-400',
    trend: {
      up: 'text-gray-400',
      down: 'text-gray-400',
      stable: 'text-gray-400'
    }
  }
};

const defaultIcons = {
  'AIV': <CpuChipIcon className="w-4 h-4" />,
  'ATI': <ShieldCheckIcon className="w-4 h-4" />,
  'CRS': <ChartBarIcon className="w-4 h-4" />,
  'Elasticity': <CurrencyDollarIcon className="w-4 h-4" />,
  'R²': <ChartBarIcon className="w-4 h-4" />,
  'Regime': <CheckCircleIcon className="w-4 h-4" />,
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'purple',
  loading = false,
  className = ''
}: MetricCardProps) {
  const colors = colorClasses[color];
  const displayIcon = icon || defaultIcons[title as keyof typeof defaultIcons];
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r ${colors.bg} rounded-xl p-6 border ${colors.border} ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
            <div className="h-4 bg-gray-700 rounded w-20"></div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${colors.bg} rounded-xl p-6 border ${colors.border} hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 ${colors.icon} rounded-lg flex items-center justify-center`}>
          {displayIcon}
        </div>
        <div className="text-sm text-gray-400">{title}</div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 ml-auto ${colors.trend[trend]}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toFixed(1) : value}
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-400">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}

// Specialized metric cards for Algorithmic Visibility Index
export function AIVMetricCard({ value, loading }: { value?: number; loading?: boolean }) {
  return (
    <MetricCard
      title="AIV™"
      value={value ? `${value.toFixed(1)}%` : '0.0%'}
      subtitle="Algorithmic Visibility Index"
      color="purple"
      loading={loading}
    />
  );
}

export function ATIMetricCard({ value, loading }: { value?: number; loading?: boolean }) {
  return (
    <MetricCard
      title="ATI™"
      value={value ? `${value.toFixed(1)}%` : '0.0%'}
      subtitle="Algorithmic Trust Index"
      color="green"
      loading={loading}
    />
  );
}

export function CRSMetricCard({ value, loading }: { value?: number; loading?: boolean }) {
  return (
    <MetricCard
      title="CRS"
      value={value ? `${value.toFixed(1)}%` : '0.0%'}
      subtitle="Composite Reputation Score"
      color="blue"
      loading={loading}
    />
  );
}

export function ElasticityMetricCard({ value, loading }: { value?: number; loading?: boolean }) {
  return (
    <MetricCard
      title="Elasticity"
      value={value ? `$${value.toLocaleString()}` : '$0'}
      subtitle="$ per +1 AIV point"
      color="yellow"
      loading={loading}
    />
  );
}

export function R2MetricCard({ value, loading }: { value?: number; loading?: boolean }) {
  return (
    <MetricCard
      title="R²"
      value={value ? `${(value * 100).toFixed(1)}%` : '0.0%'}
      subtitle="Regression Quality"
      color="gray"
      loading={loading}
    />
  );
}

export function RegimeMetricCard({ regime, loading }: { regime?: string; loading?: boolean }) {
  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Normal': return 'green';
      case 'Shift Detected': return 'yellow';
      case 'Quarantine': return 'red';
      default: return 'gray';
    }
  };

  const getRegimeIcon = (regime: string) => {
    switch (regime) {
      case 'Normal': return <CheckCircleIcon className="w-4 h-4" />;
      case 'Shift Detected': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'Quarantine': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ChartBarIcon className="w-4 h-4" />;
    }
  };

  return (
    <MetricCard
      title="Regime"
      value={regime || 'Unknown'}
      subtitle="System Status"
      color={getRegimeColor(regime || 'Unknown') as any}
      icon={getRegimeIcon(regime || 'Unknown')}
      loading={loading}
    />
  );
}
