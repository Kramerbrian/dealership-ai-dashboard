import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CpuChipIcon,
  GlobeAltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface DataVisualizationProps {
  type: 'line' | 'bar' | 'donut' | 'metric' | 'trend';
  data: any;
  title?: string;
  subtitle?: string;
  className?: string;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  type,
  data,
  title,
  subtitle,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const LineChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y, i) => (
            <line
              key={i}
              x1="40"
              y1={40 + (y / 100) * 120}
              x2="360"
              y2={40 + (y / 100) * 120}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Line path */}
          <path
            d={data.map((point, index) => {
              const x = 40 + (index / (data.length - 1)) * 320;
              const y = 40 + ((maxValue - point.value) / range) * 120;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            className="transition-all duration-1000 ease-out"
            style={{
              strokeDasharray: isLoaded ? 'none' : '1000',
              strokeDashoffset: isLoaded ? '0' : '1000'
            }}
          />

          {/* Area fill */}
          <path
            d={`${data.map((point, index) => {
              const x = 40 + (index / (data.length - 1)) * 320;
              const y = 40 + ((maxValue - point.value) / range) * 120;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')} L 360 160 L 40 160 Z`}
            fill="url(#lineGradient)"
            className="transition-all duration-1000 ease-out"
            style={{
              opacity: isLoaded ? 1 : 0
            }}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = 40 + (index / (data.length - 1)) * 320;
            const y = 40 + ((maxValue - point.value) / range) * 120;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="transition-all duration-500 ease-out hover:r-6"
                style={{
                  transform: isLoaded ? 'scale(1)' : 'scale(0)'
                }}
              />
            );
          })}

          {/* Labels */}
          {data.map((point, index) => {
            const x = 40 + (index / (data.length - 1)) * 320;
            return (
              <text
                key={index}
                x={x}
                y="190"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {point.label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const BarChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="h-64 w-full flex items-end justify-between space-x-2 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full bg-gray-200 rounded-t-lg relative overflow-hidden">
              <div
                className={`bg-gradient-to-t from-${item.color}-600 to-${item.color}-500 rounded-t-lg transition-all duration-1000 ease-out`}
                style={{
                  height: isLoaded ? `${(item.value / maxValue) * 200}px` : '0px'
                }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center">
              <div className="font-medium">{item.value}</div>
              <div className="text-gray-500">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart = ({ data }: { data: any[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const x1 = 50 + 35 * Math.cos(startAngleRad);
            const y1 = 50 + 35 * Math.sin(startAngleRad);
            const x2 = 50 + 35 * Math.cos(endAngleRad);
            const y2 = 50 + 35 * Math.sin(endAngleRad);
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');

            cumulativePercentage += percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                className="transition-all duration-1000 ease-out"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'scale(1)' : 'scale(0)'
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ data }: { data: any }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${data.color}-50`}>
          {React.createElement(data.icon, { className: `w-6 h-6 text-${data.color}-600` })}
        </div>
        <div className="flex items-center space-x-1">
          {data.trend === 'up' ? (
            <TrendingUpIcon className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(data.change)}%
          </span>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{data.value}</div>
      <div className="text-sm text-gray-600">{data.title}</div>
      {data.subtitle && (
        <div className="text-xs text-gray-500 mt-1">{data.subtitle}</div>
      )}
    </div>
  );

  const TrendChart = ({ data }: { data: any[] }) => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
            <span className="font-medium text-gray-900">{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{item.value}</span>
            <div className="flex items-center space-x-1">
              {item.trend === 'up' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(item.change)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <LineChart data={data} />;
      case 'bar':
        return <BarChart data={data} />;
      case 'donut':
        return <DonutChart data={data} />;
      case 'metric':
        return <MetricCard data={data} />;
      case 'trend':
        return <TrendChart data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      {renderChart()}
    </div>
  );
};

export default DataVisualization;
