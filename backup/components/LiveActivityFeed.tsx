'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Clock, Star, BarChart3, Target } from 'lucide-react';

interface Activity {
  id: string;
  type: 'audit' | 'improvement' | 'citation' | 'competitor_beat';
  dealership: string;
  location: string;
  score?: number;
  improvement?: number;
  timeAgo: string;
  icon: React.ReactNode;
  color: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const activityTypes = [
    {
      type: 'audit' as const,
      dealerships: ['Austin Toyota', 'Round Rock Honda', 'Cedar Park BMW', 'Georgetown Ford', 'Pflugerville Nissan'],
      locations: ['Austin, TX', 'Round Rock, TX', 'Cedar Park, TX', 'Georgetown, TX', 'Pflugerville, TX'],
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'text-blue-600',
      messages: ['completed their AI visibility audit', 'got their free AI score', 'started their AI journey']
    },
    {
      type: 'improvement' as const,
      dealerships: ['South Austin Honda', 'North Austin Toyota', 'East Austin BMW', 'West Austin Ford'],
      locations: ['Austin, TX', 'Austin, TX', 'Austin, TX', 'Austin, TX'],
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-green-600',
      messages: ['improved their AI score by', 'boosted their visibility by', 'increased their ranking by']
    },
    {
      type: 'citation' as const,
      dealerships: ['Leander Toyota', 'Lakeway Honda', 'Bee Cave BMW', 'Dripping Springs Ford'],
      locations: ['Leander, TX', 'Lakeway, TX', 'Bee Cave, TX', 'Dripping Springs, TX'],
      icon: <Star className="w-4 h-4" />,
      color: 'text-yellow-600',
      messages: ['gained new citations', 'improved their trust score', 'boosted their authority']
    },
    {
      type: 'competitor_beat' as const,
      dealerships: ['Round Rock Toyota', 'Cedar Park Honda', 'Georgetown BMW', 'Pflugerville Ford'],
      locations: ['Round Rock, TX', 'Cedar Park, TX', 'Georgetown, TX', 'Pflugerville, TX'],
      icon: <Target className="w-4 h-4" />,
      color: 'text-purple-600',
      messages: ['outranked their competitors', 'beat the competition', 'dominated their market']
    }
  ];

  const generateActivity = (): Activity => {
    const typeData = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const dealership = typeData.dealerships[Math.floor(Math.random() * typeData.dealerships.length)];
    const location = typeData.locations[Math.floor(Math.random() * typeData.locations.length)];
    const message = typeData.messages[Math.floor(Math.random() * typeData.messages.length)];
    
    const timeAgo = Math.floor(Math.random() * 10) + 1;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: typeData.type,
      dealership,
      location,
      score: typeData.type === 'audit' ? Math.floor(Math.random() * 40) + 60 : undefined,
      improvement: typeData.type === 'improvement' ? Math.floor(Math.random() * 25) + 5 : undefined,
      timeAgo: `${timeAgo} minute${timeAgo > 1 ? 's' : ''} ago`,
      icon: typeData.icon,
      color: typeData.color,
      message
    };
  };

  useEffect(() => {
    // Show the feed after 3 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Generate initial activities
    const initialActivities = Array.from({ length: 3 }, generateActivity);
    setActivities(initialActivities);

    // Add new activities every 3-5 seconds
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, 5); // Keep only 5 activities
        return updated;
      });
    }, Math.random() * 2000 + 3000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 w-80 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl z-40"
    >
      <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Live Activity</h3>
          <div className="flex items-center text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live
          </div>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${activity.color}`}>
                  {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                        {activity.dealership}
                    </span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-500 text-xs flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {activity.location}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.message}
                    {activity.score && (
                      <span className="font-semibold text-blue-600 ml-1">
                        {activity.score}
                        </span>
                      )}
                      {activity.improvement && (
                      <span className="font-semibold text-green-600 ml-1">
                        +{activity.improvement}%
                        </span>
                      )}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.timeAgo}
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      <div className="p-3 bg-gray-50 rounded-b-2xl">
        <p className="text-xs text-gray-600 text-center">
          Join <span className="font-semibold text-blue-600">500+ dealerships</span> already winning with AI
        </p>
      </div>
    </motion.div>
  );
}