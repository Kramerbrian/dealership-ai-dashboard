'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ReviewsHubTabProps {
  auditData?: any;
}

export default function ReviewsHubTab({ auditData }: ReviewsHubTabProps) {
  const [reviewsData, setReviewsData] = useState({
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    sentiment: 'positive',
    lastUpdated: new Date()
  });

  const [reviewSources, setReviewSources] = useState([
    {
      platform: 'Google',
      reviews: 156,
      rating: 4.8,
      trend: 'up',
      responseRate: 95,
      color: 'text-blue-400'
    },
    {
      platform: 'Yelp',
      reviews: 89,
      rating: 4.6,
      trend: 'up',
      responseRate: 88,
      color: 'text-red-400'
    },
    {
      platform: 'Facebook',
      reviews: 67,
      rating: 4.7,
      trend: 'down',
      responseRate: 92,
      color: 'text-blue-500'
    },
    {
      platform: 'DealerRater',
      reviews: 45,
      rating: 4.9,
      trend: 'up',
      responseRate: 100,
      color: 'text-green-400'
    }
  ]);

  const [recentReviews, setRecentReviews] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-15',
      platform: 'Google',
      text: 'Excellent service! The team at Lou Glutz Motors made buying my new car a breeze. Highly recommend!',
      sentiment: 'positive',
      response: 'Thank you Sarah! We appreciate your business.'
    },
    {
      id: 2,
      author: 'Mike Chen',
      rating: 4,
      date: '2024-01-14',
      platform: 'Yelp',
      text: 'Good selection of cars and fair pricing. The sales process was straightforward.',
      sentiment: 'positive',
      response: null
    },
    {
      id: 3,
      author: 'Jennifer Davis',
      rating: 3,
      date: '2024-01-13',
      platform: 'Facebook',
      text: 'Decent experience overall. The car I bought is great, but the financing process took longer than expected.',
      sentiment: 'neutral',
      response: 'Thank you for the feedback Jennifer. We\'re working to streamline our financing process.'
    },
    {
      id: 4,
      author: 'Robert Wilson',
      rating: 5,
      date: '2024-01-12',
      platform: 'DealerRater',
      text: 'Outstanding customer service from start to finish. The team went above and beyond to help me find the perfect vehicle.',
      sentiment: 'positive',
      response: 'We\'re thrilled you had such a great experience, Robert!'
    }
  ]);

  const [sentimentAnalysis, setSentimentAnalysis] = useState({
    positive: 78,
    neutral: 18,
    negative: 4
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setReviewsData(prev => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews + Math.floor((Math.random() - 0.5) * 2)),
        averageRating: Math.min(5, Math.max(0, prev.averageRating + (Math.random() - 0.5) * 0.1)),
        responseRate: Math.min(100, Math.max(0, prev.responseRate + (Math.random() - 0.5) * 2))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      case 'neutral': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <StarIcon className="w-8 h-8 text-yellow-400" />
            Reviews Hub
          </h2>
          <p className="text-gray-400 mt-1">
            Monitor and manage your dealership's online reputation across all platforms
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Updated</div>
          <div className="text-white font-medium">
            {reviewsData.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Reviews Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Reviews Overview</h3>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">+12 reviews this week</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{reviewsData.totalReviews}</div>
            <div className="text-sm text-gray-400">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{reviewsData.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{reviewsData.responseRate}%</div>
            <div className="text-sm text-gray-400">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{sentimentAnalysis.positive}%</div>
            <div className="text-sm text-gray-400">Positive</div>
          </div>
        </div>
      </motion.div>

      {/* Review Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviewSources.map((source, index) => (
          <motion.div
            key={source.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{source.platform}</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(source.trend)}
                <span className="text-xs text-gray-400">
                  {source.trend === 'up' ? '+5%' : '-2%'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{source.rating}</span>
                <div className="flex">{renderStars(Math.floor(source.rating))}</div>
              </div>
              <div className="text-sm text-gray-400">{source.reviews} reviews</div>
              <div className="text-sm text-gray-400">{source.responseRate}% response rate</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sentiment Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
        <div className="space-y-4">
          {Object.entries(sentimentAnalysis).map(([sentiment, percentage]) => (
            <div key={sentiment} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(sentiment)}`}>
                  {sentiment}
                </span>
                <span className="text-sm text-gray-300 capitalize">{sentiment}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      sentiment === 'positive' ? 'bg-green-500' :
                      sentiment === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-8">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Reviews</h3>
        <div className="space-y-4">
          {recentReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600/50 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-300">
                      {review.author.split(' ').map(name => name[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{review.author}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-400">{review.platform}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400">{review.date}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
                  {review.sentiment}
                </span>
              </div>
              
              <p className="text-gray-300 mb-3">{review.text}</p>
              
              {review.response && (
                <div className="bg-gray-600/30 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-blue-400">Dealership Response</span>
                  </div>
                  <p className="text-sm text-gray-300">{review.response}</p>
                </div>
              )}
              
              {!review.response && (
                <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium rounded-lg transition-colors">
                  Respond
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors">
          Sync All Reviews
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Generate Response
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
}
