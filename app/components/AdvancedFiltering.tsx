"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Types
interface FilterConfig {
  id: string;
  name: string;
  type: 'date' | 'range' | 'select' | 'multiselect' | 'boolean' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  value: any;
  label: string;
  description: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  filters: FilterConfig[];
  userCount: number;
  createdAt: Date;
  isActive: boolean;
}

interface FilteredData {
  totalUsers: number;
  filteredUsers: number;
  conversionRate: number;
  averageLTV: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  trends: Array<{ date: string; value: number }>;
}

const AdvancedFiltering = () => {
  const [filters, setFilters] = useState<FilterConfig[]>([
    {
      id: 'date-range',
      name: 'dateRange',
      type: 'date',
      value: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      label: 'Date Range',
      description: 'Filter by registration date'
    },
    {
      id: 'seo-score',
      name: 'seoScore',
      type: 'range',
      min: 0,
      max: 100,
      value: [0, 100],
      label: 'SEO Score',
      description: 'Filter by SEO performance score'
    },
    {
      id: 'traffic-volume',
      name: 'trafficVolume',
      type: 'range',
      min: 0,
      max: 10000,
      value: [0, 10000],
      label: 'Traffic Volume',
      description: 'Filter by monthly traffic volume'
    },
    {
      id: 'location',
      name: 'location',
      type: 'multiselect',
      options: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'],
      value: [],
      label: 'Location',
      description: 'Filter by geographic region'
    },
    {
      id: 'industry',
      name: 'industry',
      type: 'select',
      options: ['Automotive', 'Real Estate', 'Healthcare', 'Finance', 'Technology', 'Retail'],
      value: 'Automotive',
      label: 'Industry',
      description: 'Filter by industry type'
    },
    {
      id: 'has-reviews',
      name: 'hasReviews',
      type: 'boolean',
      value: false,
      label: 'Has Reviews',
      description: 'Filter by review presence'
    },
    {
      id: 'search-term',
      name: 'searchTerm',
      type: 'text',
      value: '',
      label: 'Search Term',
      description: 'Search by domain or business name'
    }
  ]);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Mock data
  const mockData: FilteredData = {
    totalUsers: 15420,
    filteredUsers: 3240,
    conversionRate: 12.5,
    averageLTV: 2850,
    topSources: [
      { source: 'Organic Search', count: 1200, percentage: 37.0 },
      { source: 'Direct', count: 890, percentage: 27.5 },
      { source: 'Social Media', count: 650, percentage: 20.1 },
      { source: 'Referral', count: 350, percentage: 10.8 },
      { source: 'Paid Search', count: 150, percentage: 4.6 }
    ],
    trends: [
      { date: '2024-01', value: 2800 },
      { date: '2024-02', value: 3100 },
      { date: '2024-03', value: 2900 },
      { date: '2024-04', value: 3400 },
      { date: '2024-05', value: 3200 },
      { date: '2024-06', value: 3600 }
    ]
  };

  useEffect(() => {
    loadSegments();
    applyFilters();
  }, [filters]);

  const loadSegments = async () => {
    // Mock segments
    const mockSegments: Segment[] = [
      {
        id: '1',
        name: 'High-Value Customers',
        description: 'Customers with high LTV and engagement',
        filters: filters.slice(0, 3),
        userCount: 1200,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: '2',
        name: 'New Customers',
        description: 'Recently registered customers',
        filters: [filters[0]],
        userCount: 850,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: '3',
        name: 'International',
        description: 'Customers outside North America',
        filters: [filters[3]],
        userCount: 2100,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        isActive: false
      }
    ];
    setSegments(mockSegments);
  };

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFilteredData(mockData);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (filterId: string, value: any) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, value } : filter
    ));
  };

  const resetFilters = () => {
    setFilters(prev => prev.map(filter => ({
      ...filter,
      value: filter.type === 'range' ? [filter.min || 0, filter.max || 100] :
             filter.type === 'multiselect' ? [] :
             filter.type === 'boolean' ? false :
             filter.type === 'date' ? { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() } :
             ''
    })));
  };

  const saveSegment = (name: string, description: string) => {
    const newSegment: Segment = {
      id: Date.now().toString(),
      name,
      description,
      filters: filters.filter(f => f.value !== '' && f.value !== false && f.value !== null),
      userCount: filteredData?.filteredUsers || 0,
      createdAt: new Date(),
      isActive: true
    };
    setSegments(prev => [newSegment, ...prev]);
  };

  const loadSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      setActiveSegment(segmentId);
      // Apply segment filters
      segment.filters.forEach(segmentFilter => {
        const filter = filters.find(f => f.id === segmentFilter.id);
        if (filter) {
          updateFilter(filter.id, segmentFilter.value);
        }
      });
    }
  };

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'date':
        return (
          <div className="filter-group">
            <label className="filter-label">{filter.label}</label>
            <div className="date-inputs">
              <input
                type="date"
                value={filter.value.start.toISOString().split('T')[0]}
                onChange={(e) => updateFilter(filter.id, { ...filter.value, start: new Date(e.target.value) })}
                className="filter-input"
              />
              <span>to</span>
              <input
                type="date"
                value={filter.value.end.toISOString().split('T')[0]}
                onChange={(e) => updateFilter(filter.id, { ...filter.value, end: new Date(e.target.value) })}
                className="filter-input"
              />
            </div>
            <p className="filter-description">{filter.description}</p>
          </div>
        );

      case 'range':
        return (
          <div className="filter-group">
            <label className="filter-label">{filter.label}</label>
            <div className="range-container">
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={filter.value[0]}
                onChange={(e) => updateFilter(filter.id, [parseInt(e.target.value), filter.value[1]])}
                className="range-slider"
              />
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={filter.value[1]}
                onChange={(e) => updateFilter(filter.id, [filter.value[0], parseInt(e.target.value)])}
                className="range-slider"
              />
            </div>
            <div className="range-values">
              <span>{filter.value[0]}</span>
              <span>{filter.value[1]}</span>
            </div>
            <p className="filter-description">{filter.description}</p>
          </div>
        );

      case 'select':
        return (
          <div className="filter-group">
            <label className="filter-label">{filter.label}</label>
            <select
              value={filter.value}
              onChange={(e) => updateFilter(filter.id, e.target.value)}
              className="filter-select"
            >
              {filter.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p className="filter-description">{filter.description}</p>
          </div>
        );

      case 'multiselect':
        return (
          <div className="filter-group">
            <label className="filter-label">{filter.label}</label>
            <div className="multiselect-container">
              {filter.options?.map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filter.value.includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...filter.value, option]
                        : filter.value.filter((v: string) => v !== option);
                      updateFilter(filter.id, newValue);
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
            <p className="filter-description">{filter.description}</p>
          </div>
        );

      case 'boolean':
        return (
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.value}
                onChange={(e) => updateFilter(filter.id, e.target.checked)}
              />
              {filter.label}
            </label>
            <p className="filter-description">{filter.description}</p>
          </div>
        );

      case 'text':
        return (
          <div className="filter-group">
            <label className="filter-label">{filter.label}</label>
            <input
              type="text"
              value={filter.value}
              onChange={(e) => updateFilter(filter.id, e.target.value)}
              placeholder="Enter search term..."
              className="filter-input"
            />
            <p className="filter-description">{filter.description}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="advanced-filtering">
      <div className="filtering-header">
        <h2>🔍 Advanced Filtering & Segmentation</h2>
        <p>Create custom segments and analyze your data with precision</p>
      </div>

      <div className="filtering-layout">
        {/* Filters Panel */}
        <div className="filters-panel">
          <div className="panel-header">
            <h3>Filters</h3>
            <button onClick={resetFilters} className="reset-button">
              Reset All
            </button>
          </div>

          <div className="filters-list">
            {filters.map(filter => (
              <div key={filter.id} className="filter-item">
                {renderFilter(filter)}
              </div>
            ))}
          </div>

          <div className="filter-actions">
            <button 
              onClick={() => saveSegment('Custom Segment', 'User-defined segment')}
              className="save-segment-button"
            >
              Save as Segment
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Applying filters...</p>
            </div>
          ) : filteredData ? (
            <>
              {/* Metrics Overview */}
              <div className="metrics-overview">
                <div className="metric-card">
                  <div className="metric-value">{filteredData.filteredUsers.toLocaleString()}</div>
                  <div className="metric-label">Filtered Users</div>
                  <div className="metric-percentage">
                    {((filteredData.filteredUsers / filteredData.totalUsers) * 100).toFixed(1)}% of total
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{filteredData.conversionRate}%</div>
                  <div className="metric-label">Conversion Rate</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">${filteredData.averageLTV.toLocaleString()}</div>
                  <div className="metric-label">Average LTV</div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-section">
                <div className="chart-container">
                  <h4>Traffic Sources</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={filteredData.topSources}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ source, percentage }) => `${source}: ${percentage}%`}
                      >
                        {filteredData.topSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h4>Trend Over Time</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={filteredData.trends}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2196F3" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Segments Panel */}
      <div className="segments-panel">
        <div className="panel-header">
          <h3>Saved Segments</h3>
          <span className="segment-count">{segments.length} segments</span>
        </div>

        <div className="segments-list">
          {segments.map(segment => (
            <div 
              key={segment.id} 
              className={`segment-item ${activeSegment === segment.id ? 'active' : ''}`}
              onClick={() => loadSegment(segment.id)}
            >
              <div className="segment-header">
                <h4>{segment.name}</h4>
                <span className="segment-status">
                  {segment.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="segment-description">{segment.description}</p>
              <div className="segment-metrics">
                <span>{segment.userCount.toLocaleString()} users</span>
                <span>{segment.filters.length} filters</span>
                <span>{segment.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFiltering;
