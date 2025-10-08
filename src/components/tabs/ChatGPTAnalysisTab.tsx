'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface ChatGPTAnalysisTabProps {
  auditData?: any;
}

export default function ChatGPTAnalysisTab({ auditData }: ChatGPTAnalysisTabProps) {
  const [chatgptData, setChatgptData] = useState({
    visibility: 0,
    mentions: 0,
    sentiment: 'positive',
    lastChecked: new Date(),
    queries: [] as any[]
  });

  const [testQueries, setTestQueries] = useState([
    {
      id: 1,
      query: "Best car dealership in Chicago",
      result: "mentioned",
      position: 3,
      context: "Lou Glutz Motors is one of the top-rated car dealerships in Chicago, known for their excellent customer service and wide selection of vehicles.",
      sentiment: "positive"
    },
    {
      id: 2,
      query: "Cheap used cars near me",
      result: "not mentioned",
      position: 0,
      context: "",
      sentiment: "neutral"
    },
    {
      id: 3,
      query: "Toyota dealership Chicago",
      result: "mentioned",
      position: 1,
      context: "Lou Glutz Motors is a certified Toyota dealership in Chicago with a comprehensive inventory of new and used Toyota vehicles.",
      sentiment: "positive"
    },
    {
      id: 4,
      query: "Car financing options",
      result: "mentioned",
      position: 5,
      context: "For competitive financing options, consider Lou Glutz Motors which offers flexible payment plans and competitive rates.",
      sentiment: "positive"
    }
  ]);

  const [competitorAnalysis, setCompetitorAnalysis] = useState([
    {
      name: "Chicago Auto Group",
      mentions: 12,
      sentiment: "positive",
      trend: "up"
    },
    {
      name: "Windy City Motors",
      mentions: 8,
      sentiment: "neutral",
      trend: "down"
    },
    {
      name: "Lou Glutz Motors",
      mentions: 15,
      sentiment: "positive",
      trend: "up"
    }
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setChatgptData(prev => ({
        ...prev,
        visibility: Math.min(100, prev.visibility + (Math.random() - 0.5) * 2),
        mentions: Math.max(0, prev.mentions + Math.floor((Math.random() - 0.5) * 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      case 'neutral': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'negative': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'neutral': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-400" />
            ChatGPT Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            Monitor your dealership's visibility and mentions in ChatGPT responses
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Checked</div>
          <div className="text-white font-medium">
            {chatgptData.lastChecked.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* ChatGPT Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">ChatGPT Visibility Score</h3>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">+8.2% this week</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - chatgptData.visibility / 100)}`}
                className="text-green-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{chatgptData.visibility}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">Total Mentions</div>
                <div className="text-lg font-semibold text-white">{chatgptData.mentions}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">Sentiment</div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(chatgptData.sentiment)}
                  <span className="text-lg font-semibold text-white capitalize">{chatgptData.sentiment}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Test Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Test Query Results</h3>
        <div className="space-y-4">
          {testQueries.map((query, index) => (
            <motion.div
              key={query.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center">
                    <EyeIcon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">"{query.query}"</h4>
                    <p className="text-sm text-gray-400">Query #{query.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {query.result === 'mentioned' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    query.result === 'mentioned' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                  }`}>
                    {query.result}
                  </span>
                </div>
              </div>
              
              {query.result === 'mentioned' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Position:</span>
                    <span className="text-sm font-medium text-white">#{query.position}</span>
                    <span className="text-sm text-gray-400">Sentiment:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(query.sentiment)}`}>
                      {query.sentiment}
                    </span>
                  </div>
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <p className="text-sm text-gray-300 italic">"{query.context}"</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Competitor Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Competitor Analysis</h3>
        <div className="space-y-3">
          {competitorAnalysis.map((competitor, index) => (
            <motion.div
              key={competitor.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600/50 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">
                    {competitor.name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-white">{competitor.name}</h4>
                  <p className="text-sm text-gray-400">{competitor.mentions} mentions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(competitor.sentiment)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(competitor.sentiment)}`}>
                    {competitor.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(competitor.trend)}
                  <span className="text-sm text-gray-400">
                    {competitor.trend === 'up' ? '+12%' : '-5%'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ChatGPT Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <HeartIcon className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-white">Strengths</h4>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Strong local SEO presence</li>
              <li>• Positive customer reviews</li>
              <li>• Competitive pricing mentioned</li>
              <li>• Good inventory variety</li>
            </ul>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Opportunities</h4>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Improve financing mentions</li>
              <li>• Enhance service department visibility</li>
              <li>• Target specific vehicle queries</li>
              <li>• Build more local citations</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
          Run New Analysis
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Test Custom Queries
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
}
