/**
 * Opportunities Engine Component
 * Smart recommendations and quick wins
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Clock, TrendingUp } from 'lucide-react';

interface OpportunitiesEngineProps {
  dealershipId: string;
}

export function OpportunitiesEngine({ dealershipId }: OpportunitiesEngineProps) {
  // Mock opportunities data
  const opportunities = [
    {
      id: 1,
      title: 'Optimize Google Business Profile',
      description: 'Add more detailed service descriptions and update hours',
      impact: 'High',
      effort: 'Low',
      estimatedLift: '15-20%',
      category: 'Local SEO',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Create FAQ Schema Markup',
      description: 'Add structured data for common customer questions',
      impact: 'Medium',
      effort: 'Medium',
      estimatedLift: '8-12%',
      category: 'Technical SEO',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Improve Customer Reviews',
      description: 'Implement automated review request system',
      impact: 'High',
      effort: 'Medium',
      estimatedLift: '10-15%',
      category: 'Reputation',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Add Service-Specific Content',
      description: 'Create dedicated pages for each service offering',
      impact: 'Medium',
      effort: 'High',
      estimatedLift: '5-10%',
      category: 'Content',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Smart Opportunities
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to improve your visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                          <Badge className={getPriorityColor(opportunity.priority)}>
                            {opportunity.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{opportunity.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">Impact:</span>
                            <span className={getImpactColor(opportunity.impact)}>
                              {opportunity.impact}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-gray-600">Effort:</span>
                            <span className="text-gray-900">{opportunity.effort}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Lift:</span>
                            <span className="text-green-600 font-semibold">
                              {opportunity.estimatedLift}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" className="w-full">
                          Implement
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          Learn More
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{opportunity.category}</Badge>
                        <span className="text-sm text-gray-500">
                          Estimated completion: {opportunity.effort === 'Low' ? '1-2 days' : 
                           opportunity.effort === 'Medium' ? '1-2 weeks' : '2-4 weeks'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
