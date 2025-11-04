'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Award, Zap } from 'lucide-react';

interface Activity {
  id: string;
  message: string;
  icon: React.ReactNode;
  timestamp: number;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const activityTemplates = [
    {
      message: "Premium Auto Dealership just improved their VAI by 12 points",
      icon: <TrendingUp className="w-4 h-4 text-green-500" />
    },
    {
      message: "127 dealerships analyzed today",
      icon: <Sparkles className="w-4 h-4 text-blue-500" />
    },
    {
      message: "Elite Motors upgraded to PRO",
      icon: <Award className="w-4 h-4 text-purple-500" />
    },
    {
      message: "Metro Honda recovered $24K in monthly revenue",
      icon: <Zap className="w-4 h-4 text-orange-500" />
    },
    {
      message: "Thompson Toyota increased AI visibility by 38%",
      icon: <TrendingUp className="w-4 h-4 text-green-500" />
    }
  ];

  useEffect(() => {
    // Initial activities
    const initialActivities: Activity[] = activityTemplates.slice(0, 3).map((template, index) => ({
      id: `activity-${index}`,
      message: template.message,
      icon: template.icon,
      timestamp: Date.now() - (3 - index) * 10000
    }));
    setActivities(initialActivities);

    // Add new activities periodically
    const interval = setInterval(() => {
      const randomTemplate = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const newActivity: Activity = {
        id: `activity-${Date.now()}`,
        message: randomTemplate.message,
        icon: randomTemplate.icon,
        timestamp: Date.now()
      };

      setActivities((prev) => {
        const updated = [newActivity, ...prev].slice(0, 3);
        return updated;
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg animate-slide-up"
        >
          <div className="flex-shrink-0">{activity.icon}</div>
          <p className="text-sm text-gray-700 flex-1">{activity.message}</p>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

