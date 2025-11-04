'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, TrendingUp, Users, Award, Sparkles } from 'lucide-react';

interface Activity {
  id: string;
  type: 'analyzed' | 'upgraded' | 'improved' | 'joined';
  message: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Generate initial activities
    const initialActivities: Activity[] = [
      {
        id: '1',
        type: 'analyzed',
        message: 'Premium Auto Dealership analyzed their AI visibility',
        time: '2 min ago',
        icon: <Sparkles className="w-4 h-4" />,
        color: 'text-blue-400'
      },
      {
        id: '2',
        type: 'improved',
        message: 'Elite Motors improved their VAI by 12 points',
        time: '5 min ago',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-green-400'
      },
      {
        id: '3',
        type: 'upgraded',
        message: 'Metro Car Center upgraded to PRO',
        time: '8 min ago',
        icon: <Award className="w-4 h-4" />,
        color: 'text-purple-400'
      },
      {
        id: '4',
        type: 'joined',
        message: '17 dealerships joined this hour',
        time: '12 min ago',
        icon: <Users className="w-4 h-4" />,
        color: 'text-yellow-400'
      }
    ];

    setActivities(initialActivities);

    // Add new activities periodically
    const interval = setInterval(() => {
      const dealerNames = [
        'Premium Auto', 'Elite Motors', 'Metro Car', 'City Dealers',
        'Auto Max', 'Prime Motors', 'Select Auto', 'Premier Cars'
      ];
      
      const types: Activity['type'][] = ['analyzed', 'improved', 'upgraded', 'joined'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomDealer = dealerNames[Math.floor(Math.random() * dealerNames.length)];

      const messages: Record<Activity['type'], string> = {
        analyzed: `${randomDealer} analyzed their AI visibility`,
        improved: `${randomDealer} improved their VAI by ${Math.floor(Math.random() * 15) + 5} points`,
        upgraded: `${randomDealer} upgraded to PRO`,
        joined: `${Math.floor(Math.random() * 20) + 5} dealerships joined this hour`
      };

      const icons: Record<Activity['type'], React.ReactNode> = {
        analyzed: <Sparkles className="w-4 h-4" />,
        improved: <TrendingUp className="w-4 h-4" />,
        upgraded: <Award className="w-4 h-4" />,
        joined: <Users className="w-4 h-4" />
      };

      const colors: Record<Activity['type'], string> = {
        analyzed: 'text-blue-400',
        improved: 'text-green-400',
        upgraded: 'text-purple-400',
        joined: 'text-yellow-400'
      };

      const newActivity: Activity = {
        id: Date.now().toString(),
        type: randomType,
        message: messages[randomType],
        time: 'Just now',
        icon: icons[randomType],
        color: colors[randomType]
      };

      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, 6); // Keep last 6
        return updated;
      });

      // Update time for older activities
      setTimeout(() => {
        setActivities(prev => prev.map(activity => {
          if (activity.id === newActivity.id) {
            return { ...activity, time: '1 min ago' };
          }
          return activity;
        }));
      }, 60000);
    }, 15000); // New activity every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Live Activity</h3>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-xs text-gray-300"
              >
                <div className={`mt-0.5 ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white/90">{activity.message}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

