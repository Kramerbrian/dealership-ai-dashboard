'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieChartIcon, Radar as RadarIcon } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface InteractiveChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar';
  title: string;
  description?: string;
  height?: number;
  showTrend?: boolean;
  color?: string;
  className?: string;
  interactive?: boolean;
  onDataPointClick?: (data: any) => void;
}

const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  gradient: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
};

export default function InteractiveChart({
  data,
  type,
  title,
  description,
  height = 300,
  showTrend = true,
  color = CHART_COLORS.primary,
  className = '',
  interactive = true,
  onDataPointClick
}: InteractiveChartProps) {
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [selectedData, setSelectedData] = useState<any>(null);

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].value || data[0][Object.keys(data[0]).find(k => k !== 'name') || 0];
    const last = data[data.length - 1].value || data[data.length - 1][Object.keys(data[data.length - 1]).find(k => k !== 'name') || 0];
    return ((last - first) / first) * 100;
  }, [data]);

  const handleDataPointClick = (data: any) => {
    if (interactive) {
      setSelectedData(data);
      onDataPointClick?.(data);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              onClick={handleDataPointClick}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[4, 4, 0, 0]}
              onClick={handleDataPointClick}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              fillOpacity={1} 
              fill="url(#colorGradient)"
              strokeWidth={2}
              onClick={handleDataPointClick}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleDataPointClick}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS.gradient[index % CHART_COLORS.gradient.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <PolarRadiusAxis stroke="rgba(255,255,255,0.6)" fontSize={10} />
            <Radar
              name="value"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              onClick={handleDataPointClick}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </RadarChart>
        );

      default:
        return null;
    }
  };

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line': return <Activity className="w-5 h-5" />;
      case 'bar': return <BarChart3 className="w-5 h-5" />;
      case 'pie': return <PieChartIcon className="w-5 h-5" />;
      case 'radar': return <RadarIcon className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            {getChartIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-sm text-white/60">{description}</p>
            )}
          </div>
        </div>
        
        {showTrend && (
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
        
        {/* Interactive Overlay */}
        {interactive && hoveredData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 glass-card p-3 pointer-events-none"
          >
            <div className="text-sm">
              <div className="font-medium text-white">{hoveredData.name}</div>
              <div className="text-white/60">Value: {hoveredData.value}</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Selected Data Display */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="text-sm">
              <div className="font-medium text-white">Selected: {selectedData.name}</div>
              <div className="text-white/60">Value: {selectedData.value}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
