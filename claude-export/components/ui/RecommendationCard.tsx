'use client';

import { CheckCircle, Clock, DollarSign, Target, Zap, AlertTriangle } from 'lucide-react';

interface RecommendationCardProps {
  id: string;
  title: string;
  description: string;
  impact: number;
  revenue: number;
  time: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  status?: 'pending' | 'in_progress' | 'completed';
  automated?: boolean;
  onComplete?: (id: string) => void;
  onLearn?: (id: string) => void;
}

export function RecommendationCard({
  id,
  title,
  description,
  impact,
  revenue,
  time,
  priority,
  effort,
  status = 'pending',
  automated = false,
  onComplete,
  onLearn
}: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Target className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-6 transition-all duration-300 hover:border-gray-300 ${
      status === 'completed' ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">+{impact} pts</div>
            <div className="text-xs text-gray-500">Impact</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">${revenue.toLocaleString()}/mo</div>
            <div className="text-xs text-gray-500">Revenue</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-purple-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">{time} min</div>
            <div className="text-xs text-gray-500">Time</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
          {getPriorityIcon(priority)}
          <span>{priority}</span>
        </span>
        
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(effort)}`}>
          {effort} effort
        </span>
        
        {automated && (
          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Zap className="h-3 w-3" />
            <span>Automated</span>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status === 'completed' && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3" />
              <span>Completed</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onLearn && (
            <button
              onClick={() => onLearn(id)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Learn
            </button>
          )}
          
          {status !== 'completed' && onComplete && (
            <button
              onClick={() => onComplete(id)}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Fix Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
