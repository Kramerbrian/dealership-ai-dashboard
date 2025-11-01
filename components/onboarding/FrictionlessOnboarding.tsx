'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Loader2, Globe, MapPin, Star, TrendingUp, Sparkles } from 'lucide-react';
import { mockAutoDiscoverDealer, DiscoveryResult } from '@/lib/onboarding/auto-discovery';
import MarketVisualization3D from './MarketVisualization3D';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'scanning' | 'complete';
}

export default function FrictionlessOnboarding() {
  const [step, setStep] = useState<'url' | 'scanning' | 'confirm' | 'complete'>('url');
  const [dealerUrl, setDealerUrl] = useState('');
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);
  const [scanningSteps, setScanningSteps] = useState<OnboardingStep[]>([
    { id: 'website', title: 'Analyzing website', description: 'Extracting dealer information...', status: 'pending' },
    { id: 'gbp', title: 'Finding Google Business Profile', description: 'Locating your GBP listing...', status: 'pending' },
    { id: 'competitors', title: 'Identifying competitors', description: 'Analyzing nearby dealerships...', status: 'pending' },
    { id: 'reviews', title: 'Discovering review platforms', description: 'Finding your review profiles...', status: 'pending' },
    { id: 'social', title: 'Detecting social presence', description: 'Locating social media accounts...', status: 'pending' },
  ]);

  const [editedData, setEditedData] = useState<DiscoveryResult | null>(null);

  // Handle URL submission
  const handleScan = async () => {
    if (!dealerUrl) return;

    setStep('scanning');

    // Simulate real-time scanning
    for (let i = 0; i < scanningSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));

      setScanningSteps(prev =>
        prev.map((s, index) => ({
          ...s,
          status: index === i ? 'scanning' : index < i ? 'complete' : 'pending',
        }))
      );
    }

    // Complete all steps
    setScanningSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Get discovery data
    const data = mockAutoDiscoverDealer(dealerUrl);
    setDiscoveryData(data);
    setEditedData(JSON.parse(JSON.stringify(data))); // Deep copy

    setStep('confirm');
  };

  // Handle data confirmation
  const handleConfirm = () => {
    setStep('complete');
    // Here you would save the data to the database
  };

  // Toggle review platform
  const togglePlatform = (platform: string) => {
    if (!editedData) return;

    const exists = editedData.reviewPlatforms.some(p => p.platform === platform);

    if (exists) {
      setEditedData({
        ...editedData,
        reviewPlatforms: editedData.reviewPlatforms.filter(p => p.platform !== platform),
      });
    } else {
      setEditedData({
        ...editedData,
        reviewPlatforms: [
          ...editedData.reviewPlatforms,
          { platform: platform as any, url: '', confidence: 0.5 },
        ],
      });
    }
  };

  // Remove competitor
  const removeCompetitor = (index: number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      competitors: editedData.competitors.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">DealershipAI</span>
          </h1>
          <p className="text-xl text-gray-400">
            Let's get you set up in less than 2 minutes. We'll handle the rest.
          </p>
        </motion.div>

        {/* Step 1: URL Input */}
        {step === 'url' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Enter Your Website URL</h2>
              </div>

              <p className="text-gray-400 mb-6">
                We'll automatically discover your Google Business Profile, competitors, review platforms, and more.
              </p>

              <div className="space-y-4">
                <input
                  type="url"
                  value={dealerUrl}
                  onChange={(e) => setDealerUrl(e.target.value)}
                  placeholder="www.yourdealership.com"
                  className="w-full px-6 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />

                <button
                  onClick={handleScan}
                  disabled={!dealerUrl}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Auto-Discovery
                </button>
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-300">
                  <strong>✨ What we'll discover:</strong> Google Business Profile, nearby competitors (with distances),
                  review platforms, social media, and AI-powered recommendations
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Scanning */}
        {step === 'scanning' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Scanning Your Market</h2>
                <p className="text-gray-400">Discovering your digital footprint across the web...</p>
              </div>

              <div className="space-y-4">
                {scanningSteps.map((scanStep) => (
                  <motion.div
                    key={scanStep.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {scanStep.status === 'complete' && (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {scanStep.status === 'scanning' && (
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                      )}
                      {scanStep.status === 'pending' && (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-white">{scanStep.title}</div>
                      <div className="text-sm text-gray-400">{scanStep.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm & Edit */}
        {step === 'confirm' && discoveryData && editedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                We found <span className="text-purple-400">{discoveryData.competitors.length} competitors</span> and{' '}
                <span className="text-pink-400">{discoveryData.reviewPlatforms.length} review platforms</span>
              </h2>
              <p className="text-gray-400">Confirm the details below or add/remove items</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column: Data */}
              <div className="space-y-6">
                {/* Google Business Profile */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Google Business Profile
                  </h3>
                  {editedData.gbp.verified ? (
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <div className="text-white font-semibold">{editedData.gbp.name}</div>
                        <div className="text-sm text-gray-400">{editedData.gbp.address}</div>
                        <div className="text-sm text-gray-400">{editedData.gbp.phone}</div>
                        <div className="text-xs text-green-400 mt-2">✓ Verified with {(editedData.gbp.confidence * 100).toFixed(0)}% confidence</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-amber-400">No GBP found - we'll help you create one</div>
                  )}
                </div>

                {/* Competitors */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-400" />
                    Nearby Competitors ({editedData.competitors.length})
                  </h3>
                  <div className="space-y-3">
                    {editedData.competitors.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <div className="text-white font-semibold">{comp.name}</div>
                          <div className="text-sm text-gray-400">{comp.distance.toFixed(1)} miles away</div>
                          {comp.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400">{comp.rating} ({comp.reviewCount} reviews)</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeCompetitor(index)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Platforms */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Review Platforms ({editedData.reviewPlatforms.length})
                  </h3>
                  <div className="space-y-2">
                    {(['google', 'yelp', 'dealerrater', 'cars_com', 'edmunds', 'facebook'] as const).map((platform) => {
                      const exists = editedData.reviewPlatforms.some(p => p.platform === platform);
                      const platformData = editedData.reviewPlatforms.find(p => p.platform === platform);

                      return (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            exists
                              ? 'bg-purple-500/20 border-2 border-purple-500'
                              : 'bg-gray-700/20 border-2 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {exists ? (
                              <Check className="w-5 h-5 text-purple-400" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-500" />
                            )}
                            <span className="text-white font-semibold capitalize">{platform.replace('_', '.')}</span>
                          </div>
                          {platformData?.reviewCount && (
                            <span className="text-sm text-gray-400">{platformData.reviewCount} reviews</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Visualization */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Your Market Position</h3>
                  <MarketVisualization3D discoveryData={editedData} className="h-[600px]" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setStep('url')}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleConfirm}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Looks Good - Activate Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12 shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-4">You're All Set!</h2>
              <p className="text-xl text-gray-400 mb-8">
                Your dashboard is ready. We're already tracking your AI visibility across ChatGPT, Claude, and Perplexity.
              </p>

              <button
                onClick={() => (window.location.href = '/dash')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
