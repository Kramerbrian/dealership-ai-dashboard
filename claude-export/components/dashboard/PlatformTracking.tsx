/**
 * Platform Tracking Component
 * AI platform performance monitoring
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlatformTrackingProps {
  dealershipId: string;
}

export function PlatformTracking({ dealershipId }: PlatformTrackingProps) {
  // Mock data for AI platforms
  const platforms = [
    { name: 'ChatGPT', score: 85.2, status: 'operational', trend: 'up' },
    { name: 'Perplexity', score: 78.9, status: 'operational', trend: 'up' },
    { name: 'Gemini', score: 72.1, status: 'operational', trend: 'down' },
    { name: 'Claude', score: 81.5, status: 'operational', trend: 'up' },
    { name: 'Bing Chat', score: 69.8, status: 'degraded', trend: 'down' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return { label: 'Operational', variant: 'default' as const };
      case 'degraded': return { label: 'Degraded', variant: 'secondary' as const };
      case 'down': return { label: 'Down', variant: 'destructive' as const };
      default: return { label: 'Unknown', variant: 'outline' as const };
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Platform Tracking</CardTitle>
          <CardDescription>
            Monitor your visibility across major AI platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">AI Platform</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getStatusColor(platform.status)}`}>
                        {platform.score}
                      </div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge {...getStatusBadge(platform.status)}>
                        {getStatusBadge(platform.status).label}
                      </Badge>
                      <div className={`text-sm ${
                        platform.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {platform.trend === 'up' ? '↗' : '↘'}
                      </div>
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
