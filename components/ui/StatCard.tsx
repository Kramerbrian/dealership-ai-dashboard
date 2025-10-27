'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  trend, 
  color = 'blue',
  className = '' 
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600', 
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    if (trend.direction === 'up') return 'text-green-600';
    if (trend.direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gray-50 ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>+{trend.value}</span>
          </div>
        )}
      </div>
      
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        <div className="text-sm text-gray-600">
          {label}
        </div>
      </div>
    </div>
  );
}
