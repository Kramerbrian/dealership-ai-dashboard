'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, TrendingUp } from 'lucide-react';

interface ScanActivity {
  city: string;
  brand: string;
  time: string;
  score: number;
}

export function LiveTicker() {
  const [activities, setActivities] = useState<ScanActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Mock data for live ticker
    const mockActivities: ScanActivity[] = [
      { city: "Los Angeles", brand: "Honda of LA", time: "2 min ago", score: 87 },
      { city: "Miami", brand: "BMW Miami", time: "4 min ago", score: 92 },
      { city: "Chicago", brand: "Ford Chicago", time: "6 min ago", score: 78 },
      { city: "Seattle", brand: "Toyota Seattle", time: "8 min ago", score: 85 },
      { city: "Austin", brand: "Mercedes Austin", time: "10 min ago", score: 89 },
      { city: "Denver", brand: "Audi Denver", time: "12 min ago", score: 83 },
      { city: "Phoenix", brand: "Nissan Phoenix", time: "14 min ago", score: 91 },
      { city: "Atlanta", brand: "Chevrolet Atlanta", time: "16 min ago", score: 76 },
    ];

    setActivities(mockActivities);

    // Rotate through activities every 3 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (activities.length === 0) return null;

  const currentActivity = activities[currentIndex];

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Live Activity:</span>
          </div>
          
          <div className="flex items-center space-x-4 animate-pulse">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{currentActivity.city}</span>
            </div>
            
            <div className="text-sm font-medium">
              {currentActivity.brand}
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{currentActivity.time}</span>
            </div>
            
            <div className="bg-white/20 px-2 py-1 rounded-full">
              <span className="text-sm font-semibold">{currentActivity.score} AIV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
