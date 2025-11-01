'use client';

import React, { useState } from 'react';
import { Car, MapPin, Calendar, Star, Search, Filter, Grid, List } from 'lucide-react';

// Mock data for demonstration
interface DealershipData {
  id: string;
  name: string;
  location: string;
  state: string;
  revenue: number;
  rating: number;
  isActive: boolean;
}

const mockData: DealershipData[] = [
  {
    id: '1',
    name: 'Premier Auto Group',
    location: 'Los Angeles, CA',
    state: 'California',
    revenue: 2500000,
    rating: 4.8,
    isActive: true
  },
  {
    id: '2',
    name: 'Metro Motors',
    location: 'New York, NY',
    state: 'New York',
    revenue: 1800000,
    rating: 4.5,
    isActive: true
  },
  {
    id: '3',
    name: 'Sunshine Auto',
    location: 'Miami, FL',
    state: 'Florida',
    revenue: 1200000,
    rating: 4.2,
    isActive: true
  },
  {
    id: '4',
    name: 'Mountain View Motors',
    location: 'Denver, CO',
    state: 'Colorado',
    revenue: 950000,
    rating: 4.6,
    isActive: false
  }
];

export default function SearchDemoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter data based on search criteria
  const filteredData = mockData.filter(dealership => {
    const matchesSearch = dealership.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dealership.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = !selectedState || dealership.state === selectedState;
    const matchesActive = !showActiveOnly || dealership.isActive;
    
    return matchesSearch && matchesState && matchesActive;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderDealershipCard = (dealership: DealershipData) => (
    <div
      key={dealership.id}
      className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Car className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{dealership.name}</h3>
            <div className="flex items-center gap-1 text-sm text-white/60">
              <MapPin className="w-3 h-3" />
              {dealership.location}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          dealership.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {dealership.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-xs text-white/60 mb-1">Annual Revenue</div>
          <div className="text-sm font-semibold text-white">{formatCurrency(dealership.revenue)}</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg">
          <div className="text-xs text-white/60 mb-1">Rating</div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-white">{dealership.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Advanced Search Demo</h1>
                <p className="text-sm text-white/60">DealershipAI Search & Filter System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-white/60">
                {filteredData.length} of {mockData.length} dealerships
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dealerships by name or location..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white/60">Filters:</span>
            </div>
            
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All States</option>
              <option value="California">California</option>
              <option value="New York">New York</option>
              <option value="Florida">Florida</option>
              <option value="Colorado">Colorado</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Active only
            </label>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }
        `}>
          {filteredData.map(renderDealershipCard)}
        </div>

        {/* No Results */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-white/60 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('');
                setShowActiveOnly(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}