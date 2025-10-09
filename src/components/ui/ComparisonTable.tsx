/**
 * ComparisonTable Component - Profound-inspired
 * Displays competitive comparison data
 */

import React from 'react';

interface Row {
  metric: string;
  you: number | string;
  competitor: number | string;
  avg: number | string;
  highlight?: boolean;
}

interface ComparisonTableProps {
  columns: string[];
  rows: Row[];
  title?: string;
  className?: string;
}

export function ComparisonTable({
  columns,
  rows,
  title = 'Competitive Comparison',
  className = ''
}: ComparisonTableProps) {
  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const getValueColor = (value: number | string, competitor: number | string, avg: number | string) => {
    if (typeof value === 'string' || typeof competitor === 'string' || typeof avg === 'string') {
      return 'text-white';
    }
    
    if (value > competitor && value > avg) {
      return 'text-green-400';
    } else if (value < competitor && value < avg) {
      return 'text-red-400';
    } else {
      return 'text-yellow-400';
    }
  };

  return (
    <div className={`bg-white/5 rounded-lg border border-white/10 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <tr key={index} className={row.highlight ? 'bg-white/5' : ''}>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {row.metric}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-white">
                  {formatValue(row.you)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={getValueColor(row.you, row.competitor, row.avg)}>
                    {formatValue(row.competitor)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {formatValue(row.avg)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
