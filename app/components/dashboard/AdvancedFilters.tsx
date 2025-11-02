'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X, ChevronDown, Search, Save, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'range' | 'multiselect' | 'search' | 'date';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  onApply: (activeFilters: Record<string, any>) => void;
  savedFilters?: Array<{ id: string; name: string; filters: Record<string, any> }>;
  onSaveFilter?: (name: string, filters: Record<string, any>) => void;
  onDeleteFilter?: (id: string) => void;
  enablePersistence?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onApply,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  enablePersistence = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Load saved filters from localStorage if enabled
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const saved = localStorage.getItem('advanced-filters-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActiveFilters(parsed);
          onApply(parsed);
        } catch (e) {
          // Invalid saved state
        }
      }
    }
  }, [enablePersistence, onApply]);

  // Save filters to localStorage
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem('advanced-filters-state', JSON.stringify(activeFilters));
    }
  }, [activeFilters, enablePersistence]);

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleApply = () => {
    onApply(activeFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setActiveFilters({});
    onApply({});
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem('advanced-filters-state');
    }
  };

  const handleSaveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName, activeFilters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (savedFilter: { filters: Record<string, any> }) => {
    setActiveFilters(savedFilter.filters);
    onApply(savedFilter.filters);
    setShowSavedFilters(false);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => {
      const value = activeFilters[key];
      return value !== undefined && 
             value !== '' && 
             value !== null &&
             !(Array.isArray(value) && value.length === 0);
    }
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 
          text-white transition-colors relative"
        aria-label="Open filters"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 
            text-white text-xs font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-12 right-0 w-96 z-50"
            >
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
                    {hasActiveFilters && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                        {activeFilterCount} active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {onSaveFilter && hasActiveFilters && (
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                        title="Save filter preset"
                      >
                        <Save className="w-4 h-4 text-gray-400 hover:text-purple-400" />
                      </button>
                    )}
                    {savedFilters.length > 0 && (
                      <button
                        onClick={() => setShowSavedFilters(!showSavedFilters)}
                        className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                        title="Load saved filter"
                      >
                        <Loader2 className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                      aria-label="Close filters"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Saved Filters Dropdown */}
                <AnimatePresence>
                  {showSavedFilters && savedFilters.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 space-y-2"
                    >
                      <div className="text-xs font-semibold text-gray-400 mb-2">Saved Filters</div>
                      {savedFilters.map((saved) => (
                        <div
                          key={saved.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-700/50 transition-colors"
                        >
                          <button
                            onClick={() => handleLoadFilter(saved)}
                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                          >
                            {saved.name}
                          </button>
                          {onDeleteFilter && (
                            <button
                              onClick={() => onDeleteFilter(saved.id)}
                              className="p-1 rounded hover:bg-red-500/20 transition-colors"
                              title="Delete saved filter"
                            >
                              <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                            </button>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Filter Dialog */}
                <AnimatePresence>
                  {showSaveDialog && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 rounded-lg bg-gray-800 border border-purple-500/50"
                    >
                      <div className="text-xs font-semibold text-purple-300 mb-2">Save Filter Preset</div>
                      <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Filter name..."
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 
                          text-white text-sm placeholder:text-gray-500
                          focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveFilter();
                          if (e.key === 'Escape') setShowSaveDialog(false);
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveFilter}
                          disabled={!filterName.trim()}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 
                            disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setShowSaveDialog(false);
                            setFilterName('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 
                            text-gray-300 text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Controls */}
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  {filters.map(filter => (
                    <div key={filter.id}>
                      <label className="block text-xs font-semibold text-gray-400 mb-2">
                        {filter.label}
                      </label>

                      {filter.type === 'select' && (
                        <select
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 
                            text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="">All</option>
                          {filter.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {filter.type === 'multiselect' && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {filter.options?.map(opt => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 
                                cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={(activeFilters[filter.id] || []).includes(opt.value)}
                                onChange={(e) => {
                                  const current = activeFilters[filter.id] || [];
                                  const updated = e.target.checked
                                    ? [...current, opt.value]
                                    : current.filter((v: string) => v !== opt.value);
                                  handleFilterChange(filter.id, updated);
                                }}
                                className="w-4 h-4 rounded border-gray-700 text-purple-500 
                                  focus:ring-2 focus:ring-purple-500/20 bg-gray-800"
                              />
                              <span className="text-gray-300">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {filter.type === 'range' && (
                        <div>
                          <input
                            type="range"
                            min={filter.min}
                            max={filter.max}
                            step={filter.step || 1}
                            value={activeFilters[filter.id] ?? filter.min ?? 0}
                            onChange={(e) => handleFilterChange(filter.id, Number(e.target.value))}
                            className="w-full accent-purple-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{filter.min ?? 0}</span>
                            <span className="font-semibold text-white">
                              {activeFilters[filter.id] ?? filter.min ?? 0}
                            </span>
                            <span>{filter.max ?? 100}</span>
                          </div>
                        </div>
                      )}

                      {filter.type === 'search' && (
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={activeFilters[filter.id] || ''}
                            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                            placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 
                              text-white text-sm placeholder:text-gray-500
                              focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                        </div>
                      )}

                      {filter.type === 'date' && (
                        <input
                          type="date"
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 
                            text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={handleReset}
                    disabled={!hasActiveFilters}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-gray-300 text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 
                      text-white text-sm font-semibold transition-all hover:scale-105"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};