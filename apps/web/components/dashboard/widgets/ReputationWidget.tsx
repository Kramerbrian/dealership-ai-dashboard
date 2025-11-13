/**
 * Reputation Widget
 * Review trust score, sentiment analysis, and response metrics
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReputationWidgetProps {
  data: {
    reviewTrustScore: number;
    averageRating: number;
    totalReviews: number;
    reviewVelocity: number; // reviews per month
    responseRate: number; // percentage
    sentimentScore: number; // 0-100
    recentTrend: 'up' | 'down' | 'neutral';
    platforms: Array<{
      name: string;
      rating: number;
      reviewCount: number;
      sentiment: 'positive' | 'neutral' | 'negative';
    }>;
  };
}

export default function ReputationWidget({ data }: ReputationWidgetProps) {
  const getSentimentColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 80) return 'Positive';
    if (score >= 60) return 'Neutral';
    return 'Negative';
  };

  return (
    <div className="space-y-6">
      {/* Main Reputation Score */}
      <Card>
        <CardHeader>
          <CardTitle>Reputation Trust Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl font-bold text-gray-900">{data.reviewTrustScore}</div>
                <div className="text-4xl text-gray-400">/100</div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-semibold">{data.averageRating.toFixed(1)}</span>
                <span className="text-gray-600">({data.totalReviews.toLocaleString()} reviews)</span>
              </div>
              <p className="text-sm text-gray-600">
                {data.reviewVelocity} reviews/month • {data.responseRate}% response rate
              </p>
            </div>
            <div className="text-right">
              {data.recentTrend === 'up' && (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Improving</span>
                </div>
              )}
              {data.recentTrend === 'down' && (
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="w-5 h-5 rotate-180" />
                  <span className="font-semibold">Declining</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Sentiment</span>
                <span className={`text-lg font-bold ${getSentimentColor(data.sentimentScore)}`}>
                  {data.sentimentScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.sentimentScore}%` }}
                  transition={{ duration: 1 }}
                  className={`h-3 rounded-full ${
                    data.sentimentScore >= 80 ? 'bg-green-500' :
                    data.sentimentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{getSentimentLabel(data.sentimentScore)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.platforms.map((platform, idx) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{platform.name}</p>
                    <p className="text-sm text-gray-600">{platform.reviewCount.toLocaleString()} reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{platform.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {platform.sentiment === 'positive' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {platform.sentiment === 'negative' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {platform.sentiment === 'neutral' && (
                    <div className="w-5 h-5 rounded-full bg-gray-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Response Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{data.responseRate}%</p>
              {data.responseRate >= 80 ? (
                <p className="text-sm text-green-600 mt-1">Excellent</p>
              ) : data.responseRate >= 60 ? (
                <p className="text-sm text-yellow-600 mt-1">Good</p>
              ) : (
                <p className="text-sm text-red-600 mt-1">Needs Improvement</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Review Velocity</p>
              <p className="text-3xl font-bold text-gray-900">{data.reviewVelocity}</p>
              <p className="text-sm text-gray-500 mt-1">reviews/month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

