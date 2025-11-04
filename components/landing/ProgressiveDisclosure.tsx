'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProgressiveDisclosureProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  summary?: string;
  className?: string;
}

export function ProgressiveDisclosure({
  title,
  children,
  defaultExpanded = false,
  summary,
  className = ''
}: ProgressiveDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        aria-expanded={isExpanded}
        aria-controls={`content-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {summary && !isExpanded && (
            <p className="text-sm text-gray-600 mt-1">{summary}</p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        )}
      </button>
      {isExpanded && (
        <div
          id={`content-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="px-6 py-4 border-t border-gray-200 bg-gray-50 animate-slide-down"
        >
          {children}
        </div>
      )}
    </div>
  );
}

