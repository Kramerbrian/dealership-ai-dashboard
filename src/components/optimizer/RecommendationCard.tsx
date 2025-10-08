'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import { OptimizationRecommendation } from '@/core/optimizer-engine';

interface RecommendationCardProps {
  recommendation: OptimizationRecommendation;
  onStartImplementation?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  onUpdatePriority?: (id: string, priority: string) => void;
  showActions?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onStartImplementation,
  onMarkCompleted,
  onUpdatePriority,
  showActions = true
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo': return <TrendingUp className="w-4 h-4" />;
      case 'aeo': return <Target className="w-4 h-4" />;
      case 'geo': return <BarChart3 className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      case 'general': return <Lightbulb className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStartImplementation = () => {
    setIsImplementing(true);
    onStartImplementation?.(recommendation.id);
  };

  const handleMarkCompleted = () => {
    onMarkCompleted?.(recommendation.id);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getCategoryIcon(recommendation.category)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {recommendation.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {recommendation.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority}
            </Badge>
            <Badge 
              variant="outline" 
              className={`${getScoreColor(recommendation.score)} border-current`}
            >
              {recommendation.score}/100
            </Badge>
          </div>
        </div>

        {/* Actionable Win & Opportunity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Actionable Win</h4>
            </div>
            <p className="text-blue-800 text-sm">{recommendation.actionable_win}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-900">Opportunity</h4>
            </div>
            <p className="text-green-800 text-sm">{recommendation.opportunity}</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Why This Matters</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {recommendation.explanation}
          </p>
        </div>

        {/* Implementation Steps */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Implementation Steps</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show All
                </>
              )}
            </Button>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {recommendation.implementation_steps
              .slice(0, isExpanded ? undefined : 3)
              .map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
          </ul>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{recommendation.estimated_impact.score_improvement}
            </div>
            <div className="text-xs text-gray-600">Score Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recommendation.estimated_impact.timeframe}
            </div>
            <div className="text-xs text-gray-600">Timeframe</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getEffortColor(recommendation.estimated_impact.effort_level)}`}>
              {recommendation.estimated_impact.effort_level}
            </div>
            <div className="text-xs text-gray-600">Effort Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {recommendation.estimated_impact.cost_estimate}
            </div>
            <div className="text-xs text-gray-600">Cost Estimate</div>
          </div>
        </div>

        {/* Success Metrics */}
        {isExpanded && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Success Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.success_metrics.map((metric, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Metrics */}
        {isExpanded && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Related Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.related_metrics.map((metric, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Created {recommendation.created_at.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isImplementing ? (
                <Button
                  size="sm"
                  onClick={handleStartImplementation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Implementation
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkCompleted}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Completed
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
