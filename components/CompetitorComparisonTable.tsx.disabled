'use client';
import { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface Competitor {
  id: string;
  name: string;
  domain: string;
  vai: number;
  piqr: number;
  hrp: number;
  qai: number;
  trend: 'up' | 'down' | 'stable';
  isCurrentDealer?: boolean;
}

export default function CompetitorComparisonTable() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof Competitor>('qai');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Simulate API call for competitor data
    const fetchCompetitors = async () => {
      setLoading(true);
      
      // Mock data - replace with real API call
      const mockCompetitors: Competitor[] = [
        {
          id: '1',
          name: 'Your Dealership',
          domain: 'yourdealership.com',
          vai: 87.3,
          piqr: 92.1,
          hrp: 0.12,
          qai: 78.9,
          trend: 'up',
          isCurrentDealer: true
        },
        {
          id: '2',
          name: 'Competitor A',
          domain: 'competitor-a.com',
          vai: 82.1,
          piqr: 88.5,
          hrp: 0.18,
          qai: 74.2,
          trend: 'down'
        },
        {
          id: '3',
          name: 'Competitor B',
          domain: 'competitor-b.com',
          vai: 79.8,
          piqr: 85.2,
          hrp: 0.22,
          qai: 71.5,
          trend: 'stable'
        },
        {
          id: '4',
          name: 'Competitor C',
          domain: 'competitor-c.com',
          vai: 75.4,
          piqr: 81.9,
          hrp: 0.25,
          qai: 68.1,
          trend: 'up'
        },
        {
          id: '5',
          name: 'Competitor D',
          domain: 'competitor-d.com',
          vai: 73.2,
          piqr: 79.6,
          hrp: 0.28,
          qai: 65.8,
          trend: 'down'
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setCompetitors(mockCompetitors);
        setLoading(false);
      }, 1000);
    };

    fetchCompetitors();
  }, []);

  const handleSort = (column: keyof Competitor) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedCompetitors = [...competitors].sort((a, b) => {
    const aValue = a[sortBy] as number;
    const bValue = b[sortBy] as number;
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (score <= 0.2) return 'text-green-600';
      if (score <= 0.4) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🏆</span>
          Competitor Comparison
        </h3>
        <div className="text-sm text-gray-500">
          {competitors.length} competitors tracked
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Dealership
                  {sortBy === 'name' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('vai')}
              >
                <div className="flex items-center justify-end gap-2">
                  VAI
                  {sortBy === 'vai' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('piqr')}
              >
                <div className="flex items-center justify-end gap-2">
                  PIQR
                  {sortBy === 'piqr' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('hrp')}
              >
                <div className="flex items-center justify-end gap-2">
                  HRP
                  {sortBy === 'hrp' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('qai')}
              >
                <div className="flex items-center justify-end gap-2">
                  QAI*
                  {sortBy === 'qai' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCompetitors.map((competitor, index) => (
              <tr 
                key={competitor.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  competitor.isCurrentDealer ? 'bg-blue-50' : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      competitor.isCurrentDealer ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {competitor.name}
                        {competitor.isCurrentDealer && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {competitor.domain}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-mono tabular-nums font-semibold ${getScoreColor(competitor.vai)}`}>
                    {competitor.vai.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-mono tabular-nums font-semibold ${getScoreColor(competitor.piqr)}`}>
                    {competitor.piqr.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-mono tabular-nums font-semibold ${getScoreColor(competitor.hrp, false)}`}>
                    {competitor.hrp.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-mono tabular-nums font-semibold ${getScoreColor(competitor.qai)}`}>
                    {competitor.qai.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {getTrendIcon(competitor.trend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span>Your dealership</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span>Competitors</span>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
            Add Competitor
          </button>
        </div>
      </div>
    </div>
  );
}
