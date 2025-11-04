'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Brush,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Share2,
  Maximize2,
  Minimize2,
  Settings,
  Filter,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { unparse } from 'papaparse';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface AdvancedChartWithExportProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter';
  title: string;
  description?: string;
  height?: number;
  width?: string;
  color?: string | string[];
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys?: string[];
  showLegend?: boolean;
  showBrush?: boolean;
  showZoom?: boolean;
  interactive?: boolean;
  onDataPointClick?: (data: any) => void;
  className?: string;
  exportFormats?: ('pdf' | 'png' | 'csv' | 'xlsx')[];
  metadata?: {
    author?: string;
    date?: string;
    description?: string;
  };
}

const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
];

export default function AdvancedChartWithExport({
  data,
  type,
  title,
  description,
  height = 400,
  width = '100%',
  color,
  xAxisKey = 'name',
  yAxisKey = 'value',
  dataKeys,
  showLegend = true,
  showBrush = false,
  showZoom = false,
  interactive = true,
  onDataPointClick,
  className = '',
  exportFormats = ['pdf', 'png', 'csv', 'xlsx'],
  metadata,
}: AdvancedChartWithExportProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [filteredData, setFilteredData] = useState(data);
  const [chartConfig, setChartConfig] = useState({
    showGrid: true,
    showLabels: true,
    animation: true,
  });

  // Colors
  const colors = useMemo(() => {
    if (Array.isArray(color)) return color;
    if (color) return [color];
    return CHART_COLORS;
  }, [color]);

  // Data keys for multi-series charts
  const keys = useMemo(() => {
    if (dataKeys && dataKeys.length > 0) return dataKeys;
    if (data.length > 0) {
      const firstItem = data[0];
      return Object.keys(firstItem).filter(
        (key) => key !== xAxisKey && typeof firstItem[key] === 'number'
      );
    }
    return [yAxisKey];
  }, [data, dataKeys, xAxisKey, yAxisKey]);

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    if (!chartRef.current) return;

    try {
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageWidth;
      const pdfHeight = pdf.internal.pageHeight;

      // Add title
      pdf.setFontSize(18);
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' });

      // Add description
      if (description) {
        pdf.setFontSize(12);
        pdf.text(description, pdfWidth / 2, 30, { align: 'center' });
      }

      // Add metadata
      if (metadata) {
        let yPos = 40;
        if (metadata.author) {
          pdf.setFontSize(10);
          pdf.text(`Author: ${metadata.author}`, 20, yPos);
          yPos += 5;
        }
        if (metadata.date) {
          pdf.text(`Date: ${metadata.date}`, 20, yPos);
          yPos += 5;
        }
      }

      // Export chart as image (requires html2canvas or similar)
      // For now, export data as table
      const tableData = filteredData.map((item) => {
        const row: any = { [xAxisKey]: item[xAxisKey] };
        keys.forEach((key) => {
          row[key] = item[key] || 0;
        });
        return row;
      });

      autoTable(pdf, {
        head: [[xAxisKey, ...keys]],
        body: tableData.map((row) => [
          row[xAxisKey],
          ...keys.map((key) => row[key]?.toString() || '0'),
        ]),
        startY: metadata ? 50 : 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      pdf.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }, [title, description, metadata, filteredData, xAxisKey, keys]);

  // Export to PNG
  const exportToPNG = useCallback(async () => {
    if (!chartRef.current) return;

    try {
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = imgData;
      link.click();
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      // Fallback: Try to use canvas API if available
      alert('PNG export failed. Please try PDF or CSV export instead.');
    }
  }, [title, chartRef]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    try {
      const csvData = filteredData.map((item) => {
        const row: any = { [xAxisKey]: item[xAxisKey] };
        keys.forEach((key) => {
          row[key] = item[key] || 0;
        });
        return row;
      });

      const csv = unparse(csvData, {
        header: true,
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      link.click();
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  }, [filteredData, title, xAxisKey, keys]);

  // Export to Excel (XLSX)
  const exportToExcel = useCallback(async () => {
    try {
      // Dynamic import for xlsx
      const XLSX = (await import('xlsx')).default;

      const wsData = [
        [xAxisKey, ...keys], // Header
        ...filteredData.map((item) => [
          item[xAxisKey],
          ...keys.map((key) => item[key] || 0),
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));

      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Excel export failed. Please try CSV export instead.');
    }
  }, [filteredData, title, xAxisKey, keys]);

  // Share chart
  const shareChart = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Chart URL copied to clipboard!');
    }
    setShowExportMenu(false);
  }, [title, description]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!chartRef.current) return;

    if (!isFullscreen) {
      chartRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            )}
            <XAxis
              dataKey={xAxisKey}
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                onClick={onDataPointClick}
              />
            ))}
            {showBrush && (
              <Brush
                dataKey={xAxisKey}
                height={30}
                stroke={colors[0]}
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            )}
            <XAxis
              dataKey={xAxisKey}
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                onClick={onDataPointClick}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {keys.map((key, index) => (
                <linearGradient
                  key={key}
                  id={`gradient-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colors[index % colors.length]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors[index % colors.length]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            )}
            <XAxis
              dataKey={xAxisKey}
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={`url(#gradient-${key})`}
                strokeWidth={2}
                onClick={onDataPointClick}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={chartConfig.showLabels}
              label={
                chartConfig.showLabels
                  ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
                  : false
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey={yAxisKey}
              onClick={onDataPointClick}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={filteredData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey={xAxisKey}
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <PolarRadiusAxis
              stroke="rgba(255,255,255,0.6)"
              fontSize={10}
            />
            {keys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
                onClick={onDataPointClick}
              />
            ))}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            {showLegend && <Legend />}
          </RadarChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            )}
            <XAxis
              dataKey={xAxisKey}
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Scatter
                key={key}
                name={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                onClick={onDataPointClick}
              />
            ))}
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
    >
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-white/60 mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button */}
          {interactive && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Chart Settings"
            >
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          {interactive && (
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-white/60" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white/60" />
              )}
            </button>
          )}

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
              title="Export Chart"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 glass-card p-2 rounded-lg shadow-xl z-50 min-w-[200px]"
                >
                  <div className="flex flex-col gap-1">
                    {exportFormats.includes('pdf') && (
                      <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left text-sm text-white"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                    )}
                    {exportFormats.includes('png') && (
                      <button
                        onClick={exportToPNG}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left text-sm text-white"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Export as PNG
                      </button>
                    )}
                    {exportFormats.includes('csv') && (
                      <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left text-sm text-white"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export as CSV
                      </button>
                    )}
                    {exportFormats.includes('xlsx') && (
                      <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left text-sm text-white"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export as Excel
                      </button>
                    )}
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={shareChart}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-left text-sm text-white"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Chart
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={chartConfig.showGrid}
                  onChange={(e) =>
                    setChartConfig({ ...chartConfig, showGrid: e.target.checked })
                  }
                  className="rounded"
                />
                Show Grid
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={chartConfig.showLabels}
                  onChange={(e) =>
                    setChartConfig({ ...chartConfig, showLabels: e.target.checked })
                  }
                  className="rounded"
                />
                Show Labels
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={chartConfig.animation}
                  onChange={(e) =>
                    setChartConfig({ ...chartConfig, animation: e.target.checked })
                  }
                  className="rounded"
                />
                Animation
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div className="relative">
        <ResponsiveContainer width={width} height={height}>
          {renderChart()}
        </ResponsiveContainer>

        {/* Selected Data Point Display */}
        <AnimatePresence>
          {selectedDataPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 glass-card p-3 pointer-events-none z-10"
            >
              <div className="text-sm">
                <div className="font-medium text-white">
                  {selectedDataPoint[xAxisKey]}
                </div>
                {keys.map((key) => (
                  <div key={key} className="text-white/60">
                    {key}: {selectedDataPoint[key]}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Summary */}
      {interactive && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>Data Points: {filteredData.length}</span>
            <button
              onClick={() => setFilteredData(data)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filter
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

