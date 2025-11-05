'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

interface BreakdownItem {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  fix_url?: string;
}

interface AIVBreakdownProps {
  data: BreakdownItem[];
}

export function AIVBreakdown({ data }: AIVBreakdownProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                  dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Visibility Breakdown
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Components affecting your overall score
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Items */}
      <div className="p-6 space-y-6">
        {data.map((item, idx) => (
          <BreakdownBar key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}

function BreakdownBar({ item }: { item: BreakdownItem }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const statusConfig = {
    good: {
      barColor: 'bg-green-500 dark:bg-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300'
    },
    warning: {
      barColor: 'bg-yellow-500 dark:bg-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    critical: {
      barColor: 'bg-red-500 dark:bg-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-300'
    }
  };

  const config = statusConfig[item.status];
  const percentage = (item.value / 100) * 100;

  return (
    <div>
      {/* Label + Score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {item.label}
          </span>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     relative"
          >
            <Info className="w-4 h-4" />
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                            w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs 
                            rounded-lg shadow-xl z-10">
                {item.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                              border-4 border-transparent border-t-gray-900 
                              dark:border-t-gray-700" />
              </div>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${config.textColor}`}>
            {item.value}/100
          </span>
          
          {item.fix_url && item.status !== 'good' && (
            <a
              href={item.fix_url}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Fix this →
            </a>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${config.barColor} transition-all 
                    duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status Indicator */}
      {item.status !== 'good' && (
        <div className={`mt-2 text-xs ${config.textColor}`}>
          {item.status === 'critical' ? '⚠️ Needs immediate attention' : '⚡ Could be improved'}
        </div>
      )}
    </div>
  );
}
