'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Target, Zap, CheckCircle, Lock } from 'lucide-react';

interface ScanResults {
  dealerName: string;
  aiVisibilityScore: number;
  revenueAtRisk: number;
  topIssues: string[];
  competitorData: {
    marketLeaderScore: number;
    yourRank: number;
    totalDealers: number;
  };
}

interface OnboardingBridgeProps {
  scanResults: ScanResults;
  isUnlocked: boolean;
}

export default function OnboardingBridge({ scanResults, isUnlocked }: OnboardingBridgeProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showMissionPreview, setShowMissionPreview] = useState(false);

  useEffect(() => {
    // Auto-show mission preview after 2 seconds if unlocked
    if (isUnlocked) {
      const timer = setTimeout(() => {
        setShowMissionPreview(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  const handleStartOnboarding = async () => {
    setIsSaving(true);

    try {
      // Save scan results to session storage for onboarding flow
      const onboardingContext = {
        dealerName: scanResults.dealerName,
        aiVisibilityScore: scanResults.aiVisibilityScore,
        revenueAtRisk: scanResults.revenueAtRisk,
        topIssues: scanResults.topIssues,
        competitorInsights: scanResults.competitorData,
        sourceFlow: 'landing-page-scan',
        timestamp: new Date().toISOString(),
        // Pre-filled mission briefs based on scan results
        suggestedMissions: generateMissionsFromScan(scanResults),
      };

      sessionStorage.setItem('onboarding_context', JSON.stringify(onboardingContext));

      // Track transition event
      await fetch('/api/landing/track-onboarding-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerName: scanResults.dealerName,
          score: scanResults.aiVisibilityScore,
          revenueAtRisk: scanResults.revenueAtRisk,
        }),
      });

      // Navigate to 3D onboarding flow
      router.push('/onboarding-3d?source=landing');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      setIsSaving(false);
    }
  };

  const generateMissionsFromScan = (results: ScanResults) => {
    const missions = [];

    // Mission 1: Fix AI Visibility (always present)
    missions.push({
      id: 'ai-visibility-boost',
      title: `Boost AI Visibility from ${results.aiVisibilityScore} → 85+`,
      description: `Recover $${(results.revenueAtRisk / 1000).toFixed(0)}K/month in lost AI-driven searches`,
      priority: 'critical',
      estimatedTime: '2-4 weeks',
      tools: ['Schema King', 'Content Optimizer', 'GBP Analyzer'],
    });

    // Mission 2: Close competitive gap
    if (results.competitorData.yourRank > 1) {
      missions.push({
        id: 'competitive-dominance',
        title: `Move from #${results.competitorData.yourRank} → #1 in Your Market`,
        description: 'Outrank nearby competitors in ChatGPT, Claude, and Perplexity results',
        priority: 'high',
        estimatedTime: '3-6 weeks',
        tools: ['Competitive Intelligence', 'Market Analyzer', 'Schema King'],
      });
    }

    // Mission 3: Top issue from scan
    if (results.topIssues.length > 0) {
      const topIssue = results.topIssues[0];
      missions.push({
        id: 'quick-win-fix',
        title: `Quick Win: Fix ${topIssue}`,
        description: 'Address your #1 visibility blocker identified in the scan',
        priority: 'medium',
        estimatedTime: '1-2 weeks',
        tools: ['Auto-Fix Engine', 'Schema Validator'],
      });
    }

    return missions;
  };

  if (!isUnlocked) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-8 text-center">
        <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          Unlock Your Personalized Action Plan
        </h3>
        <p className="text-gray-400 mb-6">
          Share your results or enter your email to access your custom onboarding experience
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-purple-400">
          <Sparkles className="w-4 h-4" />
          <span>3D market visualization • AI-powered missions • Auto-discovery</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onboarding Preview */}
      <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Your Personalized Action Plan is Ready</h2>
            <p className="text-purple-300">
              Based on your scan, we've created {generateMissionsFromScan(scanResults).length} custom missions
            </p>
          </div>
        </div>

        {/* Mission Preview Cards */}
        <div className={`space-y-4 mb-6 transition-all duration-500 ${
          showMissionPreview ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
        }`}>
          {generateMissionsFromScan(scanResults).map((mission, idx) => (
            <div
              key={mission.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      mission.priority === 'critical'
                        ? 'bg-red-500/20 text-red-400'
                        : mission.priority === 'high'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {mission.priority}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>{mission.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{mission.tools.length} AI tools assigned</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What You'll Get */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="font-semibold text-white mb-1">3D Market Visualization</h4>
            <p className="text-xs text-gray-400">
              See your dealership's position in a WebGL-powered 3D market map
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <CheckCircle className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="font-semibold text-white mb-1">HAL Copilot Activation</h4>
            <p className="text-xs text-gray-400">
              Your AI assistant pre-loaded with your scan insights
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <CheckCircle className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="font-semibold text-white mb-1">Auto-Discovery Complete</h4>
            <p className="text-xs text-gray-400">
              We've already identified your GBP, competitors, and review platforms
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStartOnboarding}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-2xl text-xl flex items-center justify-center gap-3 group"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Preparing Your Experience...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
              <span>Start Your Frictionless Onboarding</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          No credit card required • 3-minute setup • Cancel anytime
        </p>
      </div>

      {/* Trust & Social Proof */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {scanResults.competitorData.totalDealers}
            </div>
            <div className="text-xs text-gray-500">Dealerships in your market analyzed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              ${(scanResults.revenueAtRisk / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500">Monthly opportunity identified</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {generateMissionsFromScan(scanResults).length}
            </div>
            <div className="text-xs text-gray-500">Custom missions created for you</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              3 min
            </div>
            <div className="text-xs text-gray-500">To complete onboarding</div>
          </div>
        </div>
      </div>

      {/* Skip Option (for transparency) */}
      <div className="text-center">
        <button
          onClick={() => router.push('/dash')}
          className="text-sm text-gray-500 hover:text-gray-400 underline transition-colors"
        >
          Skip onboarding and go straight to dashboard →
        </button>
        <p className="text-xs text-gray-600 mt-1">
          (Not recommended - you'll miss the 3D market visualization)
        </p>
      </div>
    </div>
  );
}
