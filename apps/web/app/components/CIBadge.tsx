'use client';

import { useState } from 'react';

interface CI95Data {
  low: number;
  high: number;
  width: number;
  stable: boolean;
  inputs: number;
}

interface CIBadgeProps {
  ci: CI95Data;
  metric: string;
  value: number;
  className?: string;
}

export default function CIBadge({ ci, metric, value, className = '' }: CIBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatus = () => {
    if (ci.inputs < 3) {
      return { status: 'insufficient', color: 'gray', message: `Insufficient data (${ci.inputs} points)` };
    }
    if (ci.stable) {
      return { status: 'stable', color: 'green', message: `Stable (${ci.width.toFixed(1)} pts)` };
    }
    return { status: 'unstable', color: 'red', message: `Unstable (${ci.width.toFixed(1)} pts)` };
  };

  const status = getStatus();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
          status.color === 'green' 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : status.color === 'red'
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Click for CI details"
      >
        <div className={`w-2 h-2 rounded-full ${
          status.color === 'green' ? 'bg-green-500' : 
          status.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
        {status.status === 'unstable' ? 'Unstable' : 
         status.status === 'stable' ? 'Stable' : 'Insufficient'}
      </button>

      {showDetails && (
        <div className="absolute top-8 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {metric} Confidence Interval
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-medium">{value.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">CI95 Range:</span>
              <span className="font-medium">{ci.low.toFixed(1)}% - {ci.high.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">CI Width:</span>
              <span className="font-medium">{ci.width.toFixed(1)} pts</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Data Points:</span>
              <span className="font-medium">{ci.inputs}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                status.color === 'green' ? 'text-green-600' : 
                status.color === 'red' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {status.message}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {ci.inputs < 3 ? 'Need at least 3 data points for reliable CI' :
               ci.width > 8 ? 'High variance indicates unstable metric' :
               'Metric is stable and reliable'}
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
