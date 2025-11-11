'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Gauge, 
  Database, 
  Network, 
  Cpu, 
  HardDrive,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: 'caching' | 'bundling' | 'images' | 'api' | 'database';
  applied: boolean;
}

export default function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Page Load Time',
      value: 1.2,
      unit: 's',
      status: 'excellent',
      trend: 'down',
      description: 'Time to first contentful paint'
    },
    {
      name: 'Bundle Size',
      value: 245,
      unit: 'KB',
      status: 'good',
      trend: 'down',
      description: 'JavaScript bundle size'
    },
    {
      name: 'API Response Time',
      value: 180,
      unit: 'ms',
      status: 'good',
      trend: 'stable',
      description: 'Average API response time'
    },
    {
      name: 'Cache Hit Rate',
      value: 87,
      unit: '%',
      status: 'excellent',
      trend: 'up',
      description: 'Redis cache hit rate'
    },
    {
      name: 'Database Queries',
      value: 12,
      unit: 'ms',
      status: 'excellent',
      trend: 'down',
      description: 'Average query execution time'
    },
    {
      name: 'Image Optimization',
      value: 92,
      unit: '%',
      status: 'excellent',
      trend: 'up',
      description: 'Images served in WebP format'
    }
  ]);

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: 'lazy-loading',
      title: 'Implement Lazy Loading',
      description: 'Load images and components only when needed',
      impact: 'high',
      effort: 'easy',
      category: 'images',
      applied: false
    },
    {
      id: 'code-splitting',
      title: 'Code Splitting',
      description: 'Split JavaScript bundles by route',
      impact: 'high',
      effort: 'medium',
      category: 'bundling',
      applied: false
    },
    {
      id: 'api-caching',
      title: 'API Response Caching',
      description: 'Cache API responses for better performance',
      impact: 'medium',
      effort: 'easy',
      category: 'api',
      applied: true
    },
    {
      id: 'image-compression',
      title: 'Image Compression',
      description: 'Compress images without quality loss',
      impact: 'medium',
      effort: 'easy',
      category: 'images',
      applied: true
    },
    {
      id: 'database-indexing',
      title: 'Database Indexing',
      description: 'Add indexes for frequently queried fields',
      impact: 'high',
      effort: 'medium',
      category: 'database',
      applied: false
    },
    {
      id: 'cdn-optimization',
      title: 'CDN Optimization',
      description: 'Optimize content delivery network settings',
      impact: 'medium',
      effort: 'hard',
      category: 'caching',
      applied: false
    }
  ]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getImpactColor = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  const getEffortColor = (effort: OptimizationSuggestion['effort']) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
    }
  };

  const applyOptimization = (suggestionId: string) => {
    setSuggestions(prev => prev.map(suggestion => 
      suggestion.id === suggestionId 
        ? { ...suggestion, applied: true }
        : suggestion
    ));
    
    // Simulate performance improvement
    setTimeout(() => {
      setMetrics(prev => prev.map(metric => {
        if (metric.name === 'Page Load Time') {
          return { ...metric, value: Math.max(0.5, metric.value - 0.1) };
        }
        if (metric.name === 'Bundle Size') {
          return { ...metric, value: Math.max(100, metric.value - 10) };
        }
        return metric;
      }));
    }, 1000);
  };

  const runPerformanceAudit = () => {
    // Simulate performance audit
    console.log('Running performance audit...');
  };

  const getCategoryIcon = (category: OptimizationSuggestion['category']) => {
    switch (category) {
      case 'caching': return <Database className="w-4 h-4" />;
      case 'bundling': return <Cpu className="w-4 h-4" />;
      case 'images': return <HardDrive className="w-4 h-4" />;
      case 'api': return <Network className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Performance Optimizer</h1>
                <p className="text-sm text-gray-500">Monitor and optimize application performance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={runPerformanceAudit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Run Audit</span>
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Metrics */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Performance Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <motion.div
                  key={metric.name}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">{metric.name}</h3>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </div>
                  </div>
                  
                  <div className="flex items-end space-x-2 mb-2">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-lg text-gray-500">{metric.unit}</span>
                    <div className="flex items-center ml-auto">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Optimization Suggestions</h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm">Auto-optimize</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoOptimize}
                    onChange={(e) => setAutoOptimize(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-2xl p-4 border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } ${suggestion.applied ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(suggestion.category)}
                      <h3 className="font-semibold">{suggestion.title}</h3>
                    </div>
                    {suggestion.applied && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact} impact
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(suggestion.effort)}`}>
                      {suggestion.effort} effort
                    </span>
                  </div>
                  
                  {!suggestion.applied && (
                    <button
                      onClick={() => applyOptimization(suggestion.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Apply Optimization
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className={`mt-8 rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">A+</div>
              <div className="text-sm text-gray-600">Overall Grade</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">95</div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
              <div className="text-sm text-gray-600">Optimizations Applied</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
              <div className="text-sm text-gray-600">Pending Optimizations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
