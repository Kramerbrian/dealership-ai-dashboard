'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface MarketAnalysis {
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  market: {
    name: string;
    type: 'urban' | 'suburban' | 'rural';
    population: number;
    medianIncome: number;
    competitionLevel: 'low' | 'medium' | 'high';
    marketSize: 'small' | 'medium' | 'large';
  };
  automotive: {
    dealerships: number;
    averageInventory: number;
    marketShare: number;
    seasonalTrends: string[];
    localPreferences: string[];
  };
  aiOpportunity: {
    localAIOdoption: 'low' | 'medium' | 'high';
    competitorAIScores: {
      average: number;
      range: { min: number; max: number };
    };
    marketGaps: string[];
    localOpportunities: string[];
  };
  personalizedInsights: {
    marketSpecificRecommendations: string[];
    localCompetitiveAdvantages: string[];
    regionalOpportunities: string[];
    marketChallenges: string[];
  };
}

interface UseGeoPersonalizationOptions {
  autoDetect?: boolean;
  domain?: string;
  address?: string;
}

interface UseGeoPersonalizationReturn {
  location: GeoLocation | null;
  marketAnalysis: MarketAnalysis | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  analyzeMarket: (lat: number, lng: number) => Promise<void>;
  clearLocation: () => void;
}

export function useGeoPersonalization(options: UseGeoPersonalizationOptions = {}): UseGeoPersonalizationReturn {
  const { autoDetect = false, domain, address } = options;
  
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const newLocation: GeoLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setLocation(newLocation);
      
      // Automatically analyze market for the detected location
      await analyzeMarket(newLocation.latitude, newLocation.longitude);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Geolocation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeMarket = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/geo/market-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          address,
          domain
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if ((result as any).success) {
        setMarketAnalysis((result as any).data);
      } else {
        throw new Error((result as any).error || 'Failed to analyze market');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze market';
      setError(errorMessage);
      console.error('Market analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [address, domain]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setMarketAnalysis(null);
    setError(null);
  }, []);

  // Auto-detect location on mount if enabled
  useEffect(() => {
    if (autoDetect) {
      getCurrentLocation();
    }
  }, [autoDetect, getCurrentLocation]);

  return {
    location,
    marketAnalysis,
    loading,
    error,
    getCurrentLocation,
    analyzeMarket,
    clearLocation
  };
}

// Hook for getting location from IP address (fallback)
export function useIPLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Using a free IP geolocation service
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch IP location');
        }

        const data = await response.json();
        
        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 10000 // IP-based location is less accurate
          });
        } else {
          throw new Error('Invalid location data received');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get IP location';
        setError(errorMessage);
        console.error('IP location error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPLocation();
  }, []);

  return { location, loading, error };
}

// Hook for getting location from domain (if available)
export function useDomainLocation(domain?: string) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain) return;

    const fetchDomainLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        // This would typically involve:
        // 1. Looking up the domain's business address
        // 2. Using Google Maps Geocoding API
        // 3. Extracting location from business listings
        
        // For now, we'll simulate this with a mock response
        const response = await fetch('/api/geo/domain-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if ((result as any).success && (result as any).data.coordinates) {
          setLocation({
            latitude: (result as any).data.coordinates.lat,
            longitude: (result as any).data.coordinates.lng,
            accuracy: 100 // Domain-based location is more accurate than IP
          });
        } else {
          throw new Error('No location data found for domain');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get domain location';
        setError(errorMessage);
        console.error('Domain location error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDomainLocation();
  }, [domain]);

  return { location, loading, error };
}

// Utility function to format location for display
export function formatLocation(marketAnalysis: MarketAnalysis | null): string {
  if (!marketAnalysis) return '';
  
  const { location, market } = marketAnalysis;
  return `${location.city}, ${location.state}`;
}

// Utility function to get personalized greeting
export function getPersonalizedGreeting(marketAnalysis: MarketAnalysis | null): string {
  if (!marketAnalysis) return 'Welcome to DealershipAI!';
  
  const { location, market } = marketAnalysis;
  return `Welcome to DealershipAI! Based on your local market in ${location.city}, ${location.state}, here's what we've identified for your dealership opportunity.`;
}

// Utility function to get market-specific insights
export function getMarketInsights(marketAnalysis: MarketAnalysis | null): string[] {
  if (!marketAnalysis) return [];
  
  return [
    ...marketAnalysis.personalizedInsights.marketSpecificRecommendations,
    ...marketAnalysis.personalizedInsights.localCompetitiveAdvantages,
    ...marketAnalysis.personalizedInsights.regionalOpportunities
  ];
}
