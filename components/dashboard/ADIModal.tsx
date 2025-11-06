// components/dashboard/ADIModal.tsx
'use client';

import { X, TrendingUp, Award, BookOpen, User, Clock, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ModalErrorBoundary } from '@/components/modals/ModalErrorBoundary';

interface ADIModalProps {
  data: {
    overall: number;
    trend: number;
    history: Array<{ date: string; value: number }>;
    breakdown: {
      expertContent: number;
      citations: number;
      authorCredentials: number;
      contentFreshness: number;
      engagementScore: number;
    };
    recommendations?: string[];
  };
  onClose: () => void;
}

function ADIModalContent({ data, onClose }: ADIModalProps) {
  const { overall, trend, history, breakdown, recommendations = [] } = data;

  // Prepare radar chart data
  const radarData = [
    {
      subject: 'Expert Content',
      value: (breakdown.expertContent || 0) * 100,
      fullMark: 100,
    },
    {
      subject: 'Citations',
      value: (breakdown.citations || 0) * 100,
      fullMark: 100,
    },
    {
      subject: 'Author Credentials',
      value: (breakdown.authorCredentials || 0) * 100,
      fullMark: 100,
    },
    {
      subject: 'Content Freshness',
      value: (breakdown.contentFreshness || 0) * 100,
      fullMark: 100,
    },
    {
      subject: 'Engagement',
      value: (breakdown.engagementScore || 0) * 100,
      fullMark: 100,
    },
  ];

  // Component breakdown items
  const breakdownItems = [
    {
      label: 'Expert Content',
      value: Math.round((breakdown.expertContent || 0) * 100),
      weight: '30%',
      icon: Award,
      description: 'Depth and quality of technical expertise demonstrated',
      status: breakdown.expertContent >= 0.8 ? 'good' : breakdown.expertContent >= 0.5 ? 'warning' : 'critical',
    },
    {
      label: 'Citations & References',
      value: Math.round((breakdown.citations || 0) * 100),
      weight: '25%',
      icon: BookOpen,
      description: 'Number and quality of external citations',
      status: breakdown.citations >= 0.8 ? 'good' : breakdown.citations >= 0.5 ? 'warning' : 'critical',
    },
    {
      label: 'Author Credentials',
      value: Math.round((breakdown.authorCredentials || 0) * 100),
      weight: '20%',
      icon: User,
      description: 'Expertise level and credibility of content authors',
      status: breakdown.authorCredentials >= 0.8 ? 'good' : breakdown.authorCredentials >= 0.5 ? 'warning' : 'critical',
    },
    {
      label: 'Content Freshness',
      value: Math.round((breakdown.contentFreshness || 0) * 100),
      weight: '15%',
      icon: Clock,
      description: 'How recently content was updated',
      status: breakdown.contentFreshness >= 0.8 ? 'good' : breakdown.contentFreshness >= 0.5 ? 'warning' : 'critical',
    },
    {
      label: 'User Engagement',
      value: Math.round((breakdown.engagementScore || 0) * 100),
      weight: '10%',
      icon: Heart,
      description: 'User interaction and engagement metrics',
      status: breakdown.engagementScore >= 0.7 ? 'good' : breakdown.engagementScore >= 0.4 ? 'warning' : 'critical',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] 
                    overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 
                      dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Agent Discoverability Index (ADI™)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Measures how AI agents find, trust, and cite your content
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                     transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Score + Trend */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 
                        dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Current ADI Score
                </div>
                <div className="text-5xl font-light text-gray-900 dark:text-white">
                  {Math.round(overall * 100)}%
                </div>
              </div>
              
              {trend !== 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  trend > 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${trend < 0 ? 'rotate-180' : ''}`} />
                  <span className="font-semibold">
                    {trend > 0 ? '+' : ''}{Math.round(trend * 100)}%
                  </span>
                  <span className="text-sm">(7 days)</span>
                </div>
              )}
            </div>
          </div>

          {/* Radar Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Component Breakdown
            </h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="ADI Components"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Component Details
            </h3>
            <div className="space-y-3">
              {breakdownItems.map((item, idx) => {
                const Icon = item.icon;
                const statusColors = {
                  good: {
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    text: 'text-green-700 dark:text-green-300',
                    bar: 'bg-green-500 dark:bg-green-600',
                  },
                  warning: {
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    text: 'text-yellow-700 dark:text-yellow-300',
                    bar: 'bg-yellow-500 dark:bg-yellow-600',
                  },
                  critical: {
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    text: 'text-red-700 dark:text-red-300',
                    bar: 'bg-red-500 dark:bg-red-600',
                  },
                };
                const colors = statusColors[item.status as keyof typeof statusColors];

                return (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${colors.bg} rounded-lg`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            Weight: {item.weight}
                          </div>
                        </div>
                      </div>
                      <span className={`text-lg font-semibold ${colors.text}`}>
                        {item.value}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {item.description}
                    </p>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${colors.bar} transition-all 
                                  duration-1000 ease-out rounded-full`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          {history && history.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                7-Day Trend
              </h3>
              <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any) => [`${Math.round(value * 100)}%`, 'ADI']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 
                              dark:border-blue-800 rounded-lg"
                  >
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's Helping / Hurting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                What's Helping
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                {breakdownItems
                  .filter(item => item.status === 'good')
                  .map((item, idx) => (
                    <li key={idx}>• {item.label} ({item.value}%)</li>
                  ))}
                {breakdownItems.filter(item => item.status === 'good').length === 0 && (
                  <li className="text-gray-500">No components above threshold</li>
                )}
              </ul>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                What Needs Improvement
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {breakdownItems
                  .filter(item => item.status !== 'good')
                  .map((item, idx) => (
                    <li key={idx}>• {item.label} ({item.value}%)</li>
                  ))}
                {breakdownItems.filter(item => item.status !== 'good').length === 0 && (
                  <li className="text-gray-500">All components performing well</li>
                )}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => window.location.href = '/analytics'}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white 
                       rounded-lg font-semibold transition-colors"
            >
              View Full Analytics
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                       dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ADIModal(props: ADIModalProps) {
  return (
    <ModalErrorBoundary modalName="ADI Modal" onClose={props.onClose}>
      <ADIModalContent {...props} />
    </ModalErrorBoundary>
  );
}

