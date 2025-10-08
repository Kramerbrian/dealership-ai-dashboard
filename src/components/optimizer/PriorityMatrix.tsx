'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Target,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { OptimizationRecommendation } from '@/core/optimizer-engine';

interface PriorityMatrixProps {
  recommendations: OptimizationRecommendation[];
  onRecommendationClick?: (recommendation: OptimizationRecommendation) => void;
}

export default function PriorityMatrix({ 
  recommendations, 
  onRecommendationClick 
}: PriorityMatrixProps) {
  const [selectedView, setSelectedView] = useState<'impact' | 'effort' | 'time'>('impact');

  // Categorize recommendations
  const quickWins = recommendations.filter(rec => 
    rec.estimated_impact.effort_level === 'low' && 
    rec.estimated_impact.timeframe.includes('30')
  );

  const highImpact = recommendations.filter(rec => 
    rec.estimated_impact.score_improvement >= 15
  );

  const longTerm = recommendations.filter(rec => 
    rec.estimated_impact.timeframe.includes('90') || 
    rec.estimated_impact.timeframe.includes('120')
  );

  const critical = recommendations.filter(rec => 
    rec.priority === 'critical'
  );

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
      case 'compliance': return <Target className="w-4 h-4" />;
      case 'general': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderRecommendationCard = (rec: OptimizationRecommendation, category: string) => (
    <div
      key={rec.id}
      className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow bg-white"
      onClick={() => onRecommendationClick?.(rec)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getCategoryIcon(rec.category)}
          <h4 className="font-medium text-sm text-gray-900">{rec.title}</h4>
        </div>
        <Badge className={getPriorityColor(rec.priority)}>
          {rec.priority}
        </Badge>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {rec.actionable_win}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-3 h-3" />
            +{rec.estimated_impact.score_improvement}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            {rec.estimated_impact.timeframe}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${getEffortColor(rec.estimated_impact.effort_level)}`}>
          {rec.estimated_impact.effort_level}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Priority Matrix</h2>
          <p className="text-gray-600 mt-1">
            Organized recommendations by impact, effort, and timeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'impact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('impact')}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Impact
          </Button>
          <Button
            variant={selectedView === 'effort' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('effort')}
          >
            <Users className="w-4 h-4 mr-1" />
            Effort
          </Button>
          <Button
            variant={selectedView === 'time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('time')}
          >
            <Clock className="w-4 h-4 mr-1" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Critical Issues */}
      {critical.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Target className="w-5 h-5" />
              Critical Issues ({critical.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {critical.map(rec => renderRecommendationCard(rec, 'critical'))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Wins */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Zap className="w-5 h-5" />
              Quick Wins ({quickWins.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              Low effort, fast results - start here for immediate impact
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickWins.length > 0 ? (
                quickWins.map(rec => renderRecommendationCard(rec, 'quick-wins'))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No quick wins available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* High Impact */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <TrendingUp className="w-5 h-5" />
              High Impact ({highImpact.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              Significant score improvements - prioritize these for growth
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highImpact.length > 0 ? (
                highImpact.map(rec => renderRecommendationCard(rec, 'high-impact'))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No high impact items available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Long Term */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Clock className="w-5 h-5" />
              Long Term ({longTerm.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              Strategic initiatives - plan these for sustained growth
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {longTerm.length > 0 ? (
                longTerm.map(rec => renderRecommendationCard(rec, 'long-term'))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No long term items available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quick Wins</p>
                <p className="text-2xl font-bold text-green-600">{quickWins.length}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Impact</p>
                <p className="text-2xl font-bold text-orange-600">{highImpact.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Score Gain</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{recommendations.reduce((acc, rec) => acc + rec.estimated_impact.score_improvement, 0)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Week 1-2: Quick Wins */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold">1-2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Weeks 1-2: Quick Wins</h4>
                <p className="text-sm text-green-700">
                  Implement {quickWins.length} low-effort recommendations for immediate impact
                </p>
              </div>
              <div className="text-right">
                <div className="text-green-700 font-semibold">
                  +{quickWins.reduce((acc, rec) => acc + rec.estimated_impact.score_improvement, 0)} points
                </div>
                <div className="text-xs text-green-600">Expected gain</div>
              </div>
            </div>

            {/* Month 1-2: High Impact */}
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-700 font-bold">1-2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">Months 1-2: High Impact</h4>
                <p className="text-sm text-orange-700">
                  Focus on {highImpact.length} high-impact recommendations for significant growth
                </p>
              </div>
              <div className="text-right">
                <div className="text-orange-700 font-semibold">
                  +{highImpact.reduce((acc, rec) => acc + rec.estimated_impact.score_improvement, 0)} points
                </div>
                <div className="text-xs text-orange-600">Expected gain</div>
              </div>
            </div>

            {/* Month 3-6: Long Term */}
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold">3-6</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-900">Months 3-6: Long Term</h4>
                <p className="text-sm text-purple-700">
                  Execute {longTerm.length} strategic initiatives for sustained growth
                </p>
              </div>
              <div className="text-right">
                <div className="text-purple-700 font-semibold">
                  +{longTerm.reduce((acc, rec) => acc + rec.estimated_impact.score_improvement, 0)} points
                </div>
                <div className="text-xs text-purple-600">Expected gain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
