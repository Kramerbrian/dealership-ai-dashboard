'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortControlsProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  options: SortOption[];
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  className?: string;
}

export default function SortControls({
  sortBy,
  sortOrder,
  options,
  onChange,
  className = ""
}: SortControlsProps) {
  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle order if same field
      onChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      onChange(newSortBy, 'asc');
    }
  };

  const getSortIcon = (optionValue: string) => {
    if (optionValue !== sortBy) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-600" /> : 
      <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Sort by:</span>
      <div className="flex items-center gap-1">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${option.value === sortBy
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {getSortIcon(option.value)}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
