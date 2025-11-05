'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { hovercardText, type MetricKey } from '@/lib/config/hovercards';

interface HovercardProps {
  metric: MetricKey;
  className?: string;
  triggerClassName?: string;
}

/**
 * Hovercard component for displaying metric definitions
 * Shows info icon that reveals explanation on hover/click
 */
export default function Hovercard({ metric, className = '', triggerClassName = '' }: HovercardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const text = hovercardText[metric] || '';

  return (
    <span 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${triggerClassName}`}
        aria-label={`Learn more about ${metric}`}
        aria-expanded={isOpen}
      >
        <Info className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50 border border-gray-700">
          <div className="font-semibold text-blue-400 mb-1">{metric}</div>
          <p className="text-gray-300 leading-relaxed">{text}</p>
          {/* Arrow pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 transform rotate-45"></div>
        </div>
      )}
    </span>
  );
}

/**
 * Inline hovercard variant for use in text
 */
export function InlineHovercard({ metric }: { metric: MetricKey }) {
  return (
    <Hovercard 
      metric={metric}
      className="inline-flex ml-1"
      triggerClassName="w-3.5 h-3.5"
    />
  );
}

