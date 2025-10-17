'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  stepId: string;
  data: any;
  timestamp: number;
  method: 'guided' | 'agent';
}

interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  integrationData: Record<string, any>;
  userPreferences: Record<string, any>;
  lastSaved: number;
}

export function useOnboardingPersistence(method: 'guided' | 'agent' = 'guided') {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 0,
    completedSteps: [],
    integrationData: {},
    userPreferences: {},
    lastSaved: Date.now()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasRecovered, setHasRecovered] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, [method]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onboardingState.currentStep > 0) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [onboardingState]);

  const loadProgress = useCallback(async () => {
    try {
      // Load from localStorage first (fast)
      const localData = localStorage.getItem(`onboarding_${method}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        setOnboardingState(parsed);
        setHasRecovered(true);
      }

      // Then try to load from API (more reliable)
      const response = await fetch(`/api/onboarding/progress?method=${method}`);
      if (response.ok) {
        const apiData = await response.json();
        if (apiData && apiData.currentStep > 0) {
          setOnboardingState(apiData);
          setHasRecovered(true);
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [method]);

  const saveProgress = useCallback(async () => {
    try {
      // Save to localStorage (immediate)
      localStorage.setItem(`onboarding_${method}`, JSON.stringify({
        ...onboardingState,
        lastSaved: Date.now()
      }));

      // Save to API (persistent)
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          ...onboardingState,
          lastSaved: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  }, [onboardingState, method]);

  const updateStep = useCallback((stepIndex: number, stepId: string, data: any) => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: stepIndex,
      completedSteps: [...new Set([...prev.completedSteps, stepId])],
      integrationData: { ...prev.integrationData, ...data },
      lastSaved: Date.now()
    }));
  }, []);

  const updateIntegrationData = useCallback((key: string, value: any) => {
    setOnboardingState(prev => ({
      ...prev,
      integrationData: { ...prev.integrationData, [key]: value },
      lastSaved: Date.now()
    }));
  }, []);

  const updateUserPreferences = useCallback((key: string, value: any) => {
    setOnboardingState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, [key]: value },
      lastSaved: Date.now()
    }));
  }, []);

  const clearProgress = useCallback(async () => {
    try {
      localStorage.removeItem(`onboarding_${method}`);
      await fetch('/api/onboarding/progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });
      setOnboardingState({
        currentStep: 0,
        completedSteps: [],
        integrationData: {},
        userPreferences: {},
        lastSaved: Date.now()
      });
    } catch (error) {
      console.error('Failed to clear onboarding progress:', error);
    }
  }, [method]);

  const getRecoveryMessage = useCallback(() => {
    if (!hasRecovered) return null;
    
    const lastStep = onboardingState.completedSteps[onboardingState.completedSteps.length - 1];
    const integrations = Object.keys(onboardingState.integrationData).length;
    
    return {
      message: `Welcome back! We found your previous progress.`,
      details: `You were on step ${onboardingState.currentStep + 1} with ${integrations} integrations connected.`,
      lastStep,
      canResume: true
    };
  }, [hasRecovered, onboardingState]);

  return {
    onboardingState,
    isLoading,
    hasRecovered,
    updateStep,
    updateIntegrationData,
    updateUserPreferences,
    saveProgress,
    clearProgress,
    getRecoveryMessage
  };
}
