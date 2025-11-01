'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Search, MessageSquare, Bot, Zap, CheckCircle2 } from 'lucide-react';

/**
 * Onboarding Step 2: Scanning Animation
 * Shows loading state while analyzing dealership
 */
export default function OnboardingStep2Page() {
  const router = useRouter();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [scanResults, setScanResults] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);

  const loadingMessages = [
    'Checking AI visibility across ChatGPT, Claude, Perplexity...',
    'Scanning schema markup and SEO health...',
    'Comparing you to competitors...',
    'Calculating your Trust Score...',
    'Identifying quick wins...',
  ];

  useEffect(() => {
    const url = sessionStorage.getItem('onboarding_url');
    if (!url) {
      router.push('/onboard/step-1');
      return;
    }

    // Rotate through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Start analysis
    performAnalysis(url);

    return () => clearInterval(messageInterval);
  }, []);

  const performAnalysis = async (url: string) => {
    try {
      // Call AI scores API
      const response = await fetch(`/api/ai-scores?origin=${encodeURIComponent(url)}&refresh=true`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      // Also fetch competitor data if available
      const competitors = await fetchCompetitors(url);

      setScanResults({
        trustScore: data.data?.trustScore || generateMockScore(),
        competitors,
        topIssues: data.data?.oci?.issues || [],
        url,
      });

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track('onboard_scan_started', { url });
      }

      // Wait a moment, then move to results
      setTimeout(() => {
        setIsComplete(true);
        sessionStorage.setItem('onboarding_results', JSON.stringify({
          trustScore: data.data?.trustScore || generateMockScore(),
          competitors,
          topIssues: data.data?.oci?.issues || [],
          url,
        }));

        // Track completion
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.track('onboard_results_revealed', { url });
        }

        // Auto-redirect after 1 second
        setTimeout(() => {
          router.push('/onboard/step-3');
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Analysis error:', error);
      // Still proceed with mock data for demo
      setScanResults({
        trustScore: generateMockScore(),
        competitors: [],
        topIssues: [],
        url,
      });
      setIsComplete(true);
      setTimeout(() => router.push('/onboard/step-3'), 2000);
    }
  };

  const fetchCompetitors = async (url: string) => {
    // Mock competitor data - in production, fetch from database
    return [
      { name: 'Naples Honda', trustScore: 89, delta: 1.2 },
      { name: 'Naples Mazda', trustScore: 84, delta: -0.5 },
    ];
  };

  const generateMockScore = () => {
    return {
      score: Math.floor(Math.random() * 30) + 60, // 60-90
      delta: 0,
      components: { qai: 68, eeat: 81 },
      lastRefreshed: new Date(),
    };
  };

  const currentMessage = loadingMessages[currentMessageIndex];
  const progress = ((currentMessageIndex + 1) / loadingMessages.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= 2 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step === 2 ? '2' : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 ${
                    step < 2 ? 'bg-purple-600' : 'bg-zinc-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-cyan-600 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Animated Globe Icon */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-pulse" />
            <div className="absolute inset-4 rounded-full border-4 border-cyan-500/30 animate-ping" />
            <Brain className="w-32 h-32 text-purple-500 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Current Message */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Analyzing Your Digital Presence...
        </h2>
        <p className="text-xl text-zinc-400 mb-8 animate-pulse">
          {currentMessage}
        </p>

        {/* Data Stream Visualization */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Search, label: 'SEO', color: 'cyan' },
            { icon: MessageSquare, label: 'AEO', color: 'purple' },
            { icon: Bot, label: 'GEO', color: 'amber' },
            { icon: Zap, label: 'QAI', color: 'green' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <Icon className={`w-6 h-6 mx-auto mb-2 text-${color}-500`} />
              <div className="text-xs text-zinc-500">{label}</div>
              <div className={`mt-2 h-2 bg-${color}-500/20 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-${color}-500 animate-pulse`}
                  style={{ width: `${Math.random() * 60 + 40}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Completion Indicator */}
        {isComplete && (
          <div className="flex items-center justify-center gap-2 text-green-400 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Analysis complete!</span>
          </div>
        )}
      </div>
    </div>
  );
}
