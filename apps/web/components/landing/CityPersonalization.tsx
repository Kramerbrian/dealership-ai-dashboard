'use client';

import { MapPin, TrendingUp } from 'lucide-react';

interface CityPersonalizationProps {
  city: string;
}

export function CityPersonalization({ city }: CityPersonalizationProps) {
  // Mock competitor data - in production, this would come from an API
  const competitors = ['Honda of ' + city, 'Toyota ' + city, 'Ford ' + city];
  
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Top gaps we see in {city}
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Schema markup missing on 73% of VDPs</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>AI citations down 15% vs last quarter</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Page speed 2.3s slower than competitors</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Commonly cited:</span> {competitors.join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
