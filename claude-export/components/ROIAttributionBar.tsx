'use client';

interface ROIAttributionData {
  metric: string;
  contribution: number;
  percentage: number;
  impact: number; // in dollars
  trend: 'up' | 'down' | 'neutral';
}

interface ROIAttributionBarProps {
  data: ROIAttributionData[];
  totalROI: number;
  period: string;
}

export default function ROIAttributionBar({ data, totalROI, period }: ROIAttributionBarProps) {
  const sortedData = [...data].sort((a, b) => b.contribution - a.contribution);
  const maxContribution = Math.max(...data.map(d => d.contribution));

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold">ROI Attribution</div>
          <div className="text-sm text-gray-600">{period}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">+${totalROI.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Impact</div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedData.map((item, index) => (
          <div key={item.metric} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.metric}</span>
                <span className={`text-sm ${getTrendColor(item.trend)}`}>
                  {getTrendIcon(item.trend)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ${item.impact.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                style={{ 
                  width: `${(item.contribution / maxContribution) * 100}%`,
                  opacity: 0.7 + (item.contribution / maxContribution) * 0.3
                }}
              />
            </div>
            
            {/* Contribution Score */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Contribution Score: {item.contribution.toFixed(1)}</span>
              <span>Rank: #{index + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {data.filter(d => d.trend === 'up').length}
            </div>
            <div className="text-xs text-gray-600">Improving</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-600">
              {data.filter(d => d.trend === 'neutral').length}
            </div>
            <div className="text-xs text-gray-600">Stable</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {data.filter(d => d.trend === 'down').length}
            </div>
            <div className="text-xs text-gray-600">Declining</div>
          </div>
        </div>
      </div>

      {/* Top Driver Highlight */}
      {sortedData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800">
            🎯 Top Driver: {sortedData[0].metric}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Contributing {sortedData[0].percentage.toFixed(1)}% of total ROI impact
          </div>
        </div>
      )}
    </div>
  );
}
