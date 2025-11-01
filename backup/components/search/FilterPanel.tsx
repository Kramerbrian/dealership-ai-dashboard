'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Calendar, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { SearchFilter } from '@/lib/search';

interface FilterPanelProps {
  filters: SearchFilter[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function FilterPanel({
  filters,
  values,
  onChange,
  onClose,
  isOpen
}: FilterPanelProps) {
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (filterId: string) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterId)) {
      newExpanded.delete(filterId);
    } else {
      newExpanded.add(filterId);
    }
    setExpandedFilters(newExpanded);
  };

  const updateFilter = (filterId: string, value: any) => {
    onChange({
      ...values,
      [filterId]: value
    });
  };

  const clearFilter = (filterId: string) => {
    const newValues = { ...values };
    delete newValues[filterId];
    onChange(newValues);
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.keys(values).filter(key => {
      const value = values[key];
      return value !== undefined && value !== null && value !== '' && 
             !(Array.isArray(value) && value.length === 0);
    }).length;
  };

  const renderFilterInput = (filter: SearchFilter) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      updateFilter(filter.id, [...currentValues, option.value]);
                    } else {
                      updateFilter(filter.id, currentValues.filter(v => v !== option.value));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateFilter(filter.id, e.target.value ? Number(e.target.value) : '')}
            min={filter.min}
            max={filter.max}
            step={filter.step}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <button
              onClick={() => updateFilter(filter.id, !value)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {value ? (
                <ToggleRight className="h-5 w-5 text-blue-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm">{value ? 'Yes' : 'No'}</span>
            </button>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'daterange':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => updateFilter(filter.id, { ...value, start: e.target.value })}
              placeholder="Start date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => updateFilter(filter.id, { ...value, end: e.target.value })}
              placeholder="End date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-500">
                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {filters.map(filter => {
            const isExpanded = expandedFilters.has(filter.id);
            const hasValue = values[filter.id] !== undefined && values[filter.id] !== null && values[filter.id] !== '';

            return (
              <div key={filter.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFilter(filter.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">{filter.label}</div>
                    {hasValue && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Active
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasValue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFilter(filter.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    {renderFilterInput(filter)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear all filters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
