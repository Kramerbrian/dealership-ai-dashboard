/**
 * Advanced Search Bar Component
 * 
 * Global search with multi-dimensional filtering
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Calendar, SortAsc, SortDesc } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { parseSearchFilter, applySearchFilter, generateSearchSuggestions } from '@/lib/search-filter';

export interface SearchFilterConfig {
  query?: string;
  filters?: Record<string, any>;
  dateRange?: {
    start?: Date;
    end?: Date;
    field?: string;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

interface AdvancedSearchBarProps {
  onSearch?: (results: any) => void;
  placeholder?: string;
  data?: any[]; // Client-side data for instant search
  endpoint?: string; // API endpoint for server-side search
}

export function AdvancedSearchBar({
  onSearch,
  placeholder = 'Search...',
  data,
  endpoint = '/api/optimized/search',
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Client-side search (instant)
  const clientSearch = useCallback(() => {
    if (!data) return null;

    const filter = {
      query,
      filters,
      limit: 50,
    };

    const results = applySearchFilter(data, filter);
    onSearch?.(results);
    return results;
  }, [data, query, filters, onSearch]);

  // Server-side search (via API)
  const { data: serverResults, isLoading } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      
      for (const [key, value] of Object.entries(filters)) {
        params.set(`filter.${key}`, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }

      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: !data && query.length > 0,
    staleTime: 60 * 1000, // 1 minute
  });

  // Generate suggestions
  useEffect(() => {
    if (data && query.length > 2) {
      const suggestions = generateSearchSuggestions(data, query, 5);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [data, query]);

  // Trigger search
  useEffect(() => {
    if (data) {
      clientSearch();
    } else if (serverResults) {
      onSearch?.(serverResults);
    }
  }, [data, serverResults, clientSearch, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data) {
      clientSearch();
    }
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({});
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      setSuggestions([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          {query && (
            <button
              type="button"
              onClick={clearFilters}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            
            {/* Add filter UI here */}
            <div className="text-sm text-gray-500">
              Filter options can be added here (date range, status, etc.)
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

