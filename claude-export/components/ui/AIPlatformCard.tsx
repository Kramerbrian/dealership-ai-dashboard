'use client';

import { TrendingUp, TrendingDown, MessageSquare, Eye } from 'lucide-react';

interface AIPlatformCardProps {
  platform: 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini' | 'Copilot' | 'Grok';
  score: number;
  trend: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  visibility: number;
  onOptimize?: (platform: string) => void;
}

export function AIPlatformCard({
  platform,
  score,
  trend,
  mentions,
  sentiment,
  visibility,
  onOptimize
}: AIPlatformCardProps) {
  const getPlatformLogo = (platform: string) => {
    // In a real app, these would be actual logo components
    const logos = {
      ChatGPT: '🤖',
      Claude: '🧠',
      Perplexity: '🔍',
      Gemini: '💎',
      Copilot: '🛠️',
      Grok: '🐦'
    };
    return logos[platform as keyof typeof logos] || '🤖';
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      ChatGPT: 'text-teal-600 bg-teal-50 border-teal-200',
      Claude: 'text-orange-600 bg-orange-50 border-orange-200',
      Perplexity: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      Gemini: 'text-blue-600 bg-blue-50 border-blue-200',
      Copilot: 'text-blue-600 bg-blue-50 border-blue-200',
      Grok: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTrendIcon = () => {
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend.direction === 'up') return 'text-green-600';
    if (trend.direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-6 hover:border-gray-300 transition-all duration-300 ${getPlatformColor(platform)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getPlatformLogo(platform)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{platform}</h3>
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.value}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="text-sm text-gray-500">AI Score</div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{mentions} mentions</span>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(sentiment)}`}>
            {sentiment}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Visibility: {visibility}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Visibility</span>
          <span>{visibility}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${visibility}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button */}
      {onOptimize && (
        <button
          onClick={() => onOptimize(platform)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <span>Optimize for {platform}</span>
        </button>
      )}
    </div>
  );
}
