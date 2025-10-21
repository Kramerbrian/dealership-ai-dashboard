'use client';

import React, { useState, useEffect } from 'react';
import { useCohortTuning } from '@/hooks/useCohortTuning';
import { useABTesting } from '@/hooks/useABTesting';
import { useCanaryDeployment } from '@/hooks/useCanaryDeployment';
import { EnhancedAIOpportunityCalculator } from '@/components/calculator/EnhancedAIOpportunityCalculator';
import { MicroInteraction } from '@/components/onboarding/EnhancedMicroInteractions';

export default function LandingPageWithAnalytics() {
  const [userData, setUserData] = useState({
    location: '',
    deviceType: 'desktop',
    referralSource: 'direct',
    sessionStart: new Date()
  });

  // Analytics hooks
  const {
    cohorts,
    personalizedActions,
    insights,
    loading: cohortLoading,
    analyzeUser
  } = useCohortTuning({ 
    userId: 'landing-visitor', 
    userData, 
    context: { page: 'landing' },
    autoAnalyze: true 
  });

  const {
    test,
    variantId,
    trackEvent,
    loading: abLoading
  } = useABTesting({ 
    testId: 'landing-page-optimization', 
    userId: 'landing-visitor',
    context: { page: 'landing' },
    autoAssign: true 
  });

  const {
    shouldReceiveCanary,
    featureConfig,
    loading: canaryLoading
  } = useCanaryDeployment({ 
    deploymentId: 'landing-page-v2', 
    userId: 'landing-visitor',
    context: { page: 'landing' },
    autoCheck: true 
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showPersonalizedGreeting, setShowPersonalizedGreeting] = useState(false);

  useEffect(() => {
    // Detect user context
    const detectUserContext = () => {
      const isMobile = window.innerWidth < 768;
      const userAgent = navigator.userAgent;
      const isChrome = userAgent.includes('Chrome');
      
      setUserData(prev => ({
        ...prev,
        deviceType: isMobile ? 'mobile' : 'desktop',
        browserType: isChrome ? 'chrome' : 'other'
      }));
    };

    detectUserContext();
    
    // Track landing page visit
    trackEvent({
      type: 'page_view',
      page: 'landing',
      timestamp: new Date().toISOString()
    });
  }, [trackEvent]);

  useEffect(() => {
    // Show personalized greeting after cohort analysis
    if (cohorts.length > 0 && !cohortLoading) {
      setShowPersonalizedGreeting(true);
    }
  }, [cohorts, cohortLoading]);

  const handleCalculateOpportunity = () => {
    // Track calculator interaction
    trackEvent({
      type: 'calculator_opened',
      page: 'landing',
      timestamp: new Date().toISOString()
    });
    
    setShowCalculator(true);
  };

  const getPersonalizedContent = () => {
    if (cohorts.includes('high-value-dealers')) {
      return {
        title: "Enterprise AI Solutions for High-Volume Dealers",
        subtitle: "Scale your AI visibility across multiple locations with advanced analytics",
        cta: "Schedule Enterprise Demo"
      };
    } else if (cohorts.includes('new-dealers')) {
      return {
        title: "Get Started with AI-Powered Dealership Marketing",
        subtitle: "Simple setup, powerful results. We'll guide you every step of the way.",
        cta: "Start Free Trial"
      };
    } else if (cohorts.includes('mobile-users')) {
      return {
        title: "AI Marketing Made Mobile",
        subtitle: "Manage your dealership's AI presence on the go",
        cta: "Download Mobile App"
      };
    }
    
    return {
      title: "Boost Your Dealership's AI Visibility",
      subtitle: "Get found by customers using AI-powered search",
      cta: "Calculate My Opportunity"
    };
  };

  const content = getPersonalizedContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Personalized Greeting */}
      {showPersonalizedGreeting && (
        <MicroInteraction
          type="celebration"
          message={`Welcome! We've personalized your experience based on your profile.`}
          duration={3000}
        />
      )}

      {/* Hero Section with A/B Test Variants */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* A/B Test Variant Content */}
            {variantId === 'simplified' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-5xl font-bold text-gray-900">
                  {content.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {content.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCalculateOpportunity}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {content.cta}
                  </button>
                  <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                    Watch Demo
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h1 className="text-6xl font-bold text-gray-900">
                  {content.title}
                </h1>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                  {content.subtitle}
                </p>
                
                {/* Feature highlights based on canary deployment */}
                {shouldReceiveCanary && featureConfig.showFeatureHighlights && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                      <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                      <p className="text-gray-600">Real-time website optimization</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                      <h3 className="font-semibold text-gray-900">Local SEO</h3>
                      <p className="text-gray-600">Google Business Profile optimization</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                      <h3 className="font-semibold text-gray-900">Analytics</h3>
                      <p className="text-gray-600">Performance tracking dashboard</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCalculateOpportunity}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {content.cta}
                  </button>
                  <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                    Watch Demo
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Personalized Insights Section */}
      {insights.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Personalized for Your Market
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {insights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{insight.insight}</h3>
                  <p className="text-gray-600 text-sm">{insight.recommendation}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCalculator(false)} />
            <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold">AI-Enhanced Opportunity Calculator</h2>
                  <p className="text-gray-600">Personalized analysis for your dealership</p>
                </div>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                <EnhancedAIOpportunityCalculator />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
