'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  ChartBarIcon, 
  TrophyIcon, 
  SparklesIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'audit' | 'score_improvement' | 'new_citation' | 'competitor_beat';
  dealership: string;
  location: string;
  score?: number;
  improvement?: number;
  timestamp: Date;
  message: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Sample activity data
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'audit',
      dealership: 'Toyota of Austin',
      location: 'Austin, TX',
      score: 87,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      message: 'completed AI visibility audit'
    },
    {
      id: '2',
      type: 'score_improvement',
      dealership: 'Honda Center',
      location: 'Dallas, TX',
      score: 82,
      improvement: 15,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      message: 'improved AI visibility score'
    },
    {
      id: '3',
      type: 'new_citation',
      dealership: 'BMW of Texas',
      location: 'Houston, TX',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      message: 'featured in ChatGPT response'
    },
    {
      id: '4',
      type: 'competitor_beat',
      dealership: 'Mercedes-Benz Dallas',
      location: 'Dallas, TX',
      score: 91,
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      message: 'outranked local competitors'
    },
    {
      id: '5',
      type: 'audit',
      dealership: 'Ford of San Antonio',
      location: 'San Antonio, TX',
      score: 76,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      message: 'completed AI visibility audit'
    }
  ];

  useEffect(() => {
    // Show the activity feed after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Add activities progressively
    let index = 0;
    const addActivity = () => {
      if (index < sampleActivities.length) {
        setActivities(prev => [sampleActivities[index], ...prev.slice(0, 4)]);
        index++;
        setTimeout(addActivity, 4000 + Math.random() * 2000);
      }
    };

    addActivity();
  }, [isVisible]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'audit':
        return <EyeIcon className="w-4 h-4" />;
      case 'score_improvement':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'new_citation':
        return <SparklesIcon className="w-4 h-4" />;
      case 'competitor_beat':
        return <TrophyIcon className="w-4 h-4" />;
      default:
        return <EyeIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'audit':
        return 'text-blue-600 bg-blue-50';
      case 'score_improvement':
        return 'text-green-600 bg-green-50';
      case 'new_citation':
        return 'text-purple-600 bg-purple-50';
      case 'competitor_beat':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (!isVisible || activities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 right-6 z-40 max-w-sm"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">Live Activity</h3>
            </div>
            <div className="text-xs text-blue-100">
              <ClockIcon className="w-3 h-3 inline mr-1" />
              Real-time
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-slate-900 text-sm">
                        {activity.dealership}
                      </span>
                      {activity.score && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {activity.score}/100
                        </span>
                      )}
                      {activity.improvement && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          +{activity.improvement}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-1">
                      {activity.message}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{activity.location}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span className="font-medium">{activities.length}</span> recent activities
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
