/**
 * DealershipAI v2.0 - Dashboard Hook
 * 
 * Custom hook for managing dashboard state and API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient, AnalyzeRequest, AnalyzeResponse, EEATRequest, EEATResponse, MysteryShopTest } from '@/src/lib/api-client';

export interface DashboardState {
  // Data
  dealership: AnalyzeResponse['dealership'] | null;
  scores: AnalyzeResponse['scores'] | null;
  eeat: AnalyzeResponse['eeat'] | null;
  mysteryShopTests: MysteryShopTest[];
  
  // Session info
  tier: string;
  sessionsUsed: number;
  sessionsLimit: number;
  sessionsResetAt: string;
  
  // UI state
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface DashboardActions {
  analyzeDealership: (request: AnalyzeRequest) => Promise<void>;
  analyzeEEAT: (request: EEATRequest) => Promise<void>;
  scheduleMysteryShop: (dealershipId: string, testType: string, scheduledFor: string, testParameters?: any) => Promise<void>;
  executeMysteryShop: (mysteryShopId: string, results: any) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useDashboard(initialAuthToken?: string): DashboardState & DashboardActions {
  const [state, setState] = useState<DashboardState>({
    dealership: null,
    scores: null,
    eeat: null,
    mysteryShopTests: [],
    tier: 'FREE',
    sessionsUsed: 0,
    sessionsLimit: 0,
    sessionsResetAt: '',
    loading: false,
    error: null,
    lastUpdated: null,
  });

  // Set auth token
  useEffect(() => {
    if (initialAuthToken) {
      apiClient.setAuthToken(initialAuthToken);
    }
  }, [initialAuthToken]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Analyze dealership
  const analyzeDealership = useCallback(async (request: AnalyzeRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.analyzeDealership(request);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          dealership: response.data!.dealership,
          scores: response.data!.scores,
          eeat: response.data!.eeat || null,
          tier: response.data!.tier,
          sessionsUsed: response.data!.sessionsUsed,
          sessionsLimit: response.data!.sessionsLimit,
          sessionsResetAt: response.data!.sessionsResetAt,
          lastUpdated: response.data!.timestamp,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Analysis failed',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        loading: false,
      }));
    }
  }, []);

  // Analyze E-E-A-T
  const analyzeEEAT = useCallback(async (request: EEATRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.analyzeEEAT(request);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          eeat: response.data!.eeat,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'E-E-A-T analysis failed',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'E-E-A-T analysis failed',
        loading: false,
      }));
    }
  }, []);

  // Schedule mystery shop test
  const scheduleMysteryShop = useCallback(async (
    dealershipId: string,
    testType: string,
    scheduledFor: string,
    testParameters?: any
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.scheduleMysteryShop(dealershipId, testType, scheduledFor, testParameters);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          mysteryShopTests: [response.data!.mysteryShop, ...prev.mysteryShopTests],
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to schedule mystery shop test',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to schedule mystery shop test',
        loading: false,
      }));
    }
  }, []);

  // Execute mystery shop test
  const executeMysteryShop = useCallback(async (mysteryShopId: string, results: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.executeMysteryShop(mysteryShopId, results);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          mysteryShopTests: prev.mysteryShopTests.map(test =>
            test.id === mysteryShopId ? response.data!.mysteryShop : test
          ),
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to execute mystery shop test',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute mystery shop test',
        loading: false,
      }));
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (state.dealership) {
      await analyzeDealership({
        dealerId: state.dealership.id,
        dealerName: state.dealership.name,
        city: state.dealership.city,
        state: state.dealership.state,
        website: state.dealership.website,
        phone: state.dealership.phone,
        email: state.dealership.email,
      });
    }
  }, [state.dealership, analyzeDealership]);

  // Load mystery shop tests
  const loadMysteryShopTests = useCallback(async (dealershipId: string) => {
    try {
      const response = await apiClient.getMysteryShopTests(dealershipId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          mysteryShopTests: response.data!.mysteryShops,
        }));
      }
    } catch (error) {
      console.error('Failed to load mystery shop tests:', error);
    }
  }, []);

  // Load mystery shop tests when dealership changes
  useEffect(() => {
    if (state.dealership) {
      loadMysteryShopTests(state.dealership.id);
    }
  }, [state.dealership, loadMysteryShopTests]);

  return {
    ...state,
    analyzeDealership,
    analyzeEEAT,
    scheduleMysteryShop,
    executeMysteryShop,
    refreshData,
    clearError,
  };
}

// Export convenience hook for specific use cases
export function useAnalyzeDealership(authToken?: string) {
  const dashboard = useDashboard(authToken);
  
  return {
    analyze: dashboard.analyzeDealership,
    loading: dashboard.loading,
    error: dashboard.error,
    scores: dashboard.scores,
    dealership: dashboard.dealership,
    clearError: dashboard.clearError,
  };
}

export function useEEATAnalysis(authToken?: string) {
  const dashboard = useDashboard(authToken);
  
  return {
    analyze: dashboard.analyzeEEAT,
    loading: dashboard.loading,
    error: dashboard.error,
    eeat: dashboard.eeat,
    clearError: dashboard.clearError,
  };
}

export function useMysteryShop(authToken?: string) {
  const dashboard = useDashboard(authToken);
  
  return {
    tests: dashboard.mysteryShopTests,
    schedule: dashboard.scheduleMysteryShop,
    execute: dashboard.executeMysteryShop,
    loading: dashboard.loading,
    error: dashboard.error,
    clearError: dashboard.clearError,
  };
}
