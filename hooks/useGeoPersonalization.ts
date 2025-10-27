/**
 * Geo Personalization Hook
 * Automatically detects user location and provides market-specific insights
 */

import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

interface MarketAnalysis {
  localCompetitors: number;
  marketShare: number;
  avgZeroClickRate: number;
  benchmarkVsMarket: number;
  regionalInsights: string[];
}

export function useGeoPersonalization({ autoDetect }: { autoDetect: boolean }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try browser geolocation first
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Reverse geocode to get city/state
        const geoData = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
        ).then(r => r.json());

        setLocation({
          city: geoData.city || '',
          state: geoData.principalSubdivision || '',
          zipCode: geoData.postcode || '',
          country: geoData.countryName || '',
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get location'));
      setLoading(false);
    }
  };

  const analyzeMarket = async (locationData: LocationData) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with real API call
      // For now, return mock market analysis
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnalysis: MarketAnalysis = {
        localCompetitors: 12,
        marketShare: 8.3,
        avgZeroClickRate: 0.45,
        benchmarkVsMarket: 0.15, // 15 points above market
        regionalInsights: [
          `Your zero-click rate is 15% lower than ${locationData.city} market average`,
          `${locationData.state} dealerships average 45% zero-click, you're at 30%`,
          `Top 3 competitors in ${locationData.city} have 25% higher ZCR`
        ]
      };

      setMarketAnalysis(mockAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to analyze market'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoDetect) {
      getCurrentLocation();
    }
  }, [autoDetect]);

  useEffect(() => {
    if (location && autoDetect) {
      analyzeMarket(location);
    }
  }, [location, autoDetect]);

  return {
    location,
    marketAnalysis,
    loading,
    error,
    getCurrentLocation,
    analyzeMarket
  };
}