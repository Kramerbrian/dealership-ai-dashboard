'use client';

/**
 * DealerQueryExplorer Component - Profound-inspired
 * Shows volume of queries about dealerships across AI engines
 */

import React, { useState } from 'react';
import { Trend } from '@/components/ui/Trend';

interface QueryData {
  query: string;
  volume: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  category: 'research' | 'comparison' | 'purchase' | 'service';
  brand?: string;
  location?: string;
}

interface DealerQueryExplorerProps {
  queries: QueryData[];
  className?: string;
}

export function DealerQueryExplorer({
  queries,
  className = ''
}: DealerQueryExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'research', 'comparison', 'purchase', 'service'];
  const brands = ['all', 'Toyota', 'Ford', 'Honda', 'BMW', 'Mercedes', 'Chevrolet'];

  const filteredQueries = queries.filter(query => {
    const matchesCategory = selectedCategory === 'all' || query.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || query.brand === selectedBrand;
    const matchesSearch = searchTerm === '' || 
      query.query.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research': return 'text-blue-400 bg-blue-500/20';
      case 'comparison': return 'text-purple-400 bg-purple-500/20';
      case 'purchase': return 'text-green-400 bg-green-500/20';
      case 'service': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const totalVolume = filteredQueries.reduce((sum, query) => sum + query.volume, 0);

  return (
    <div className={`bg-white/5 p-6 rounded-lg border border-white/10 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Dealer Query Explorer</h3>
        <p className="text-gray-400 text-sm">
          Discover what buyers are actually asking AI about dealerships
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedBrand === brand
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Query List */}
      <div className="space-y-3">
        {filteredQueries.slice(0, 20).map((query, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white font-medium">{query.query}</span>
                <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(query.category)}`}>
                  {query.category}
                </span>
                {query.brand && (
                  <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
                    {query.brand}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {query.volume.toLocaleString()} queries/month
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Trend
                value={query.trendValue}
                direction={query.trend}
                timeframe="vs last month"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Showing {filteredQueries.length} queries • Total volume: {totalVolume.toLocaleString()}/month
      </div>
    </div>
  );
}
