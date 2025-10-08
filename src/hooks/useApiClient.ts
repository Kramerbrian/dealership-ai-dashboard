import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '../lib/api-client';

export interface UseApiClientReturn {
  // State
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // OAuth methods
  initiateGoogleAuth: () => Promise<void>;
  handleOAuthCallback: (code: string, state?: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => void;
  
  // API methods
  getAnalyticsData: (propertyId: string, startDate?: string, endDate?: string) => Promise<ApiResponse>;
  getPageSpeedData: (url: string, strategy?: 'mobile' | 'desktop') => Promise<ApiResponse>;
  getSEMrushData: (domain: string) => Promise<ApiResponse>;
  getYelpData: (businessId?: string, term?: string, location?: string) => Promise<ApiResponse>;
  getAICitationAnalysis: (businessName: string, location: string) => Promise<ApiResponse>;
  getBatchAnalysis: (dealershipUrl: string, businessName: string, location: string) => Promise<ApiResponse>;
  
  // Google services
  getGoogleAnalyticsProperties: () => Promise<ApiResponse>;
  getGoogleBusinessAccounts: () => Promise<ApiResponse>;
  getGoogleSearchConsoleSites: () => Promise<ApiResponse>;
}

export function useApiClient(): UseApiClientReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = useCallback(async () => {
    const token = localStorage.getItem('google_access_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.validateGoogleToken();
      
      if (response.success && response.data?.valid) {
        setIsAuthenticated(true);
        setError(null);
      } else {
        // Token is invalid, try to refresh
        const refreshToken = localStorage.getItem('google_refresh_token');
        if (refreshToken) {
          await refreshTokenFromStorage();
        } else {
          setIsAuthenticated(false);
          apiClient.clearTokens();
        }
      }
    } catch (err: any) {
      console.error('Authentication check failed:', err);
      setIsAuthenticated(false);
      apiClient.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTokenFromStorage = useCallback(async () => {
    const refreshToken = localStorage.getItem('google_refresh_token');
    if (!refreshToken) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await apiClient.refreshGoogleToken(refreshToken);
      
      if (response.success && response.data?.tokens?.access_token) {
        apiClient.setAccessToken(response.data.tokens.access_token);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setIsAuthenticated(false);
        apiClient.clearTokens();
      }
    } catch (err: any) {
      console.error('Token refresh failed:', err);
      setIsAuthenticated(false);
      apiClient.clearTokens();
    }
  }, []);

  const initiateGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getGoogleAuthUrl();
      
      if (response.success && response.data?.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl;
      } else {
        setError(response.error || 'Failed to get authorization URL');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google authentication');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOAuthCallback = useCallback(async (code: string, state?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you'd handle this on the backend
      // For now, we'll simulate the token exchange
      const response = await fetch(`/api/oauth/google/callback?code=${code}&state=${state}`);
      const data = await response.json();
      
      if (data.success && data.tokens?.access_token) {
        apiClient.setAccessToken(data.tokens.access_token);
        if (data.tokens.refresh_token) {
          localStorage.setItem('google_refresh_token', data.tokens.refresh_token);
        }
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'OAuth callback failed');
      }
    } catch (err: any) {
      setError(err.message || 'OAuth callback failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    await refreshTokenFromStorage();
  }, [refreshTokenFromStorage]);

  const logout = useCallback(() => {
    apiClient.clearTokens();
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // API wrapper methods with error handling
  const apiWrapper = useCallback(async <T>(
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (!response.success) {
        setError(response.error || 'API request failed');
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'API request failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        details: err,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    isAuthenticated,
    
    // OAuth methods
    initiateGoogleAuth,
    handleOAuthCallback,
    refreshToken,
    logout,
    
    // API methods
    getAnalyticsData: useCallback((propertyId: string, startDate?: string, endDate?: string) =>
      apiWrapper(() => apiClient.getAnalyticsData(propertyId, startDate, endDate)), [apiWrapper]),
    
    getPageSpeedData: useCallback((url: string, strategy?: 'mobile' | 'desktop') =>
      apiWrapper(() => apiClient.getPageSpeedData(url, strategy)), [apiWrapper]),
    
    getSEMrushData: useCallback((domain: string) =>
      apiWrapper(() => apiClient.getSEMrushData(domain)), [apiWrapper]),
    
    getYelpData: useCallback((businessId?: string, term?: string, location?: string) =>
      apiWrapper(() => apiClient.getYelpData(businessId, term, location)), [apiWrapper]),
    
    getAICitationAnalysis: useCallback((businessName: string, location: string) =>
      apiWrapper(() => apiClient.getAICitationAnalysis(businessName, location)), [apiWrapper]),
    
    getBatchAnalysis: useCallback((dealershipUrl: string, businessName: string, location: string) =>
      apiWrapper(() => apiClient.getBatchAnalysis(dealershipUrl, businessName, location)), [apiWrapper]),
    
    // Google services
    getGoogleAnalyticsProperties: useCallback(() =>
      apiWrapper(() => apiClient.getGoogleAnalyticsProperties()), [apiWrapper]),
    
    getGoogleBusinessAccounts: useCallback(() =>
      apiWrapper(() => apiClient.getGoogleBusinessAccounts()), [apiWrapper]),
    
    getGoogleSearchConsoleSites: useCallback(() =>
      apiWrapper(() => apiClient.getGoogleSearchConsoleSites()), [apiWrapper]),
  };
}
