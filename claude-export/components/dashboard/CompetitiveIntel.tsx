/**
 * Competitive Intelligence Component
 * War room and competitive analysis
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Users, Award } from 'lucide-react';

interface CompetitiveIntelProps {
  dealershipId: string;
}

export function CompetitiveIntel({ dealershipId }: CompetitiveIntelProps) {
  // Mock competitive data
  const competitors = [
    { name: 'Luxury Motors', score: 92.1, trend: 'up', marketShare: 18.5 },
    { name: 'Your Dealership', score: 78.5, trend: 'up', marketShare: 12.3 },
    { name: 'Speedy Autos', score: 76.2, trend: 'down', marketShare: 15.7 },
    { name: 'Family Cars', score: 71.8, trend: 'stable', marketShare: 11.2 },
    { name: 'Elite Vehicles', score: 69.5, trend: 'up', marketShare: 9.8 }
  ];

  const marketInsights = [
    {
      title: 'Market Leader Analysis',
      description: 'Luxury Motors leads with 92.1 AI visibility score',
      impact: 'High',
      action: 'Study their content strategy and local SEO approach'
    },
    {
      title: 'Rising Competitor',
      description: 'Elite Vehicles showing 15% improvement this quarter',
      impact: 'Medium',
      action: 'Monitor their new marketing initiatives'
    },
    {
      title: 'Market Gap',
      description: 'Opportunity in service-specific content creation',
      impact: 'High',
      action: 'Create comprehensive service pages before competitors'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Competitive Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Competitive Rankings
          </CardTitle>
          <CardDescription>
            Your position in the local automotive market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <motion.div
                key={competitor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  competitor.name === 'Your Dealership' 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index === 0 ? <Award className="w-4 h-4" /> : index + 1}
                    </div>
                    
                    <div>
                      <h3 className={`font-semibold ${
                        competitor.name === 'Your Dealership' ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {competitor.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {competitor.marketShare}% market share
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        competitor.name === 'Your Dealership' ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {competitor.score}
                      </div>
                      <div className="text-sm text-gray-600">AI Score</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getTrendIcon(competitor.trend)}
                      <span className={`text-sm ${getTrendColor(competitor.trend)}`}>
                        {competitor.trend === 'up' ? '↗' : competitor.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Market Insights
          </CardTitle>
          <CardDescription>
            AI-powered competitive intelligence and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                      <p className="text-sm text-blue-600 font-medium">{insight.action}</p>
                    </div>
                    
                    <div className="ml-4">
                      <Badge className={
                        insight.impact === 'High' ? 'bg-red-100 text-red-600' :
                        insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }>
                        {insight.impact} Impact
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
