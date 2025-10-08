'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface MysteryShopTabProps {
  auditData?: any;
}

export default function MysteryShopTab({ auditData }: MysteryShopTabProps) {
  const [mysteryShopData, setMysteryShopData] = useState({
    totalShops: 0,
    averageScore: 0,
    responseTime: 0,
    lastShop: new Date()
  });

  const [shopResults, setShopResults] = useState([
    {
      id: 1,
      date: '2024-01-15',
      method: 'Phone Call',
      duration: '3:45',
      score: 85,
      status: 'completed',
      notes: 'Friendly service, quick response time, knowledgeable staff'
    },
    {
      id: 2,
      date: '2024-01-12',
      method: 'Website Chat',
      duration: '8:20',
      score: 92,
      status: 'completed',
      notes: 'Excellent online support, provided detailed information about financing options'
    },
    {
      id: 3,
      date: '2024-01-10',
      method: 'Email Inquiry',
      duration: '2:15',
      score: 78,
      status: 'completed',
      notes: 'Good response time, but could have been more detailed in the initial response'
    },
    {
      id: 4,
      date: '2024-01-08',
      method: 'In-Person Visit',
      duration: '45:30',
      score: 88,
      status: 'completed',
      notes: 'Great showroom experience, salesperson was professional and helpful'
    }
  ]);

  const [competitorComparison, setCompetitorComparison] = useState([
    {
      name: 'Chicago Auto Group',
      score: 82,
      responseTime: '4:20',
      trend: 'up'
    },
    {
      name: 'Windy City Motors',
      score: 76,
      responseTime: '6:15',
      trend: 'down'
    },
    {
      name: 'Lou Glutz Motors',
      score: 86,
      responseTime: '3:45',
      trend: 'up'
    }
  ]);

  const [shopMetrics, setShopMetrics] = useState({
    phoneResponse: 0,
    emailResponse: 0,
    chatResponse: 0,
    inPersonScore: 0
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMysteryShopData(prev => ({
        ...prev,
        totalShops: Math.max(0, prev.totalShops + Math.floor((Math.random() - 0.5) * 2)),
        averageScore: Math.min(100, Math.max(0, prev.averageScore + (Math.random() - 0.5) * 2))
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20';
    if (score >= 80) return 'text-yellow-400 bg-yellow-500/20';
    if (score >= 70) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'in-progress': return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'failed': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Phone Call': return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" />;
      case 'Website Chat': return <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-400" />;
      case 'Email Inquiry': return <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />;
      case 'In-Person Visit': return <EyeIcon className="w-5 h-5 text-orange-400" />;
      default: return <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-purple-400" />
            Mystery Shop
          </h2>
          <p className="text-gray-400 mt-1">
            Monitor customer experience quality through secret shopping evaluations
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Shop</div>
          <div className="text-white font-medium">
            {mysteryShopData.lastShop.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Mystery Shop Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Mystery Shop Performance</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">+3.2% this month</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{mysteryShopData.totalShops}</div>
            <div className="text-sm text-gray-400">Total Shops</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{mysteryShopData.averageScore}</div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{mysteryShopData.responseTime}m</div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">92%</div>
            <div className="text-sm text-gray-400">Completion Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Shop Methods Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { method: 'Phone Call', score: 85, icon: '📞', color: 'text-blue-400' },
          { method: 'Email Inquiry', score: 78, icon: '📧', color: 'text-purple-400' },
          { method: 'Website Chat', score: 92, icon: '💬', color: 'text-green-400' },
          { method: 'In-Person Visit', score: 88, icon: '🏢', color: 'text-orange-400' }
        ].map((method, index) => (
          <motion.div
            key={method.method}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{method.icon}</span>
              <h4 className="font-semibold text-white">{method.method}</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Score</span>
                <span className={`text-lg font-bold ${method.color}`}>{method.score}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    method.score >= 90 ? 'bg-green-500' :
                    method.score >= 80 ? 'bg-yellow-500' :
                    method.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${method.score}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Shop Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Shop Results</h3>
        <div className="space-y-4">
          {shopResults.map((shop, index) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getMethodIcon(shop.method)}
                  <div>
                    <h4 className="font-medium text-white">Shop #{shop.id}</h4>
                    <p className="text-sm text-gray-400">{shop.date} • {shop.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(shop.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(shop.score)}`}>
                    {shop.score}/100
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Duration:</span> {shop.duration}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Status:</span> {shop.status}
                </div>
              </div>
              
              <div className="bg-gray-600/30 rounded-lg p-3">
                <p className="text-sm text-gray-300">{shop.notes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Competitor Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Competitor Comparison</h3>
        <div className="space-y-3">
          {competitorComparison.map((competitor, index) => (
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
                  <p className="text-sm text-gray-400">Avg response: {competitor.responseTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(competitor.score)}`}>
                  {competitor.score}/100
                </span>
                <span className="text-sm text-gray-400">
                  {competitor.trend === 'up' ? '↗' : '↘'} {competitor.trend === 'up' ? '+5%' : '-2%'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
          Schedule New Shop
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          View Detailed Report
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Data
        </button>
      </div>
    </div>
  );
}
