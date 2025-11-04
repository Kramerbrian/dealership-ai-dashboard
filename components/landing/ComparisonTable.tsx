'use client';

import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface ComparisonFeature {
  name: string;
  us: string | boolean;
  competitor1: string | boolean;
  competitor2: string | boolean;
  highlight?: boolean;
}

interface ComparisonTableProps {
  title?: string;
  features?: ComparisonFeature[];
}

export function ComparisonTable({
  title = "DealershipAI vs. Competitors",
  features
}: ComparisonTableProps) {
  const defaultFeatures: ComparisonFeature[] = [
    {
      name: 'AI Visibility Tracking',
      us: true,
      competitor1: false,
      competitor2: 'Limited',
      highlight: true
    },
    {
      name: 'Multi-Platform Monitoring',
      us: '5 platforms',
      competitor1: '1 platform',
      competitor2: '3 platforms',
      highlight: true
    },
    {
      name: 'Real-time Alerts',
      us: true,
      competitor1: true,
      competitor2: true
    },
    {
      name: 'Competitive Intelligence',
      us: true,
      competitor1: false,
      competitor2: 'Basic',
      highlight: true
    },
    {
      name: 'Zero-Click Shield',
      us: true,
      competitor1: false,
      competitor2: false,
      highlight: true
    },
    {
      name: 'Automated Fixes',
      us: true,
      competitor1: false,
      competitor2: 'Manual',
      highlight: true
    },
    {
      name: 'Revenue Impact Analysis',
      us: true,
      competitor1: false,
      competitor2: false,
      highlight: true
    },
    {
      name: 'Starting Price',
      us: '$499/mo',
      competitor1: '$999/mo',
      competitor2: '$799/mo',
      highlight: true
    },
    {
      name: 'Free Trial',
      us: '14 days',
      competitor1: '7 days',
      competitor2: 'No trial',
      highlight: true
    },
    {
      name: 'Support',
      us: 'Priority',
      competitor1: 'Standard',
      competitor2: 'Email only'
    }
  ];

  const displayFeatures = features || defaultFeatures;

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-500 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">See why DealershipAI is the best choice</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DealershipAI
                </span>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Competitor A</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Competitor B</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayFeatures.map((feature, i) => (
              <tr
                key={i}
                className={`hover:bg-gray-50 transition-colors ${
                  feature.highlight ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{feature.name}</span>
                    {feature.highlight && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                        Best
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    {renderValue(feature.us)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    {renderValue(feature.competitor1)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    {renderValue(feature.competitor2)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Ready to see the difference?</h4>
            <p className="text-sm text-gray-600">Start your free 14-day trial today</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

