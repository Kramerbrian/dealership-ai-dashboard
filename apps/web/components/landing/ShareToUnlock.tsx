'use client';

import { useState } from 'react';
import { Share2, Twitter, Linkedin, Facebook, Mail, Lock, CheckCircle, ExternalLink } from 'lucide-react';

interface ShareToUnlockProps {
  dealerName?: string;
  revenueAtRisk: number;
  onUnlock: () => void;
  isUnlocked?: boolean;
}

export default function ShareToUnlock({
  dealerName = 'Your Dealership',
  revenueAtRisk,
  onUnlock,
  isUnlocked = false,
}: ShareToUnlockProps) {
  const [selectedMethod, setSelectedMethod] = useState<'share' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shareText = `Just discovered ${dealerName} is missing $${(revenueAtRisk / 1000).toFixed(0)}K/month in AI-driven searches. See how your dealership ranks: `;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dealershipai.com';

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    // Open share window
    window.open(urls[platform], '_blank', 'width=600,height=400');

    // Track share attempt
    await fetch('/api/landing/track-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, dealerName }),
    });

    // Unlock after short delay (simulating share completion)
    setTimeout(() => {
      onUnlock();
    }, 2000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/landing/email-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, dealerName, revenueAtRisk }),
      });

      onUnlock();
    } catch (error) {
      console.error('Email submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnlocked) {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Full Report Unlocked!</h3>
            <p className="text-sm text-gray-300">Thank you for sharing</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-3">
            Your complete AI Visibility Report includes:
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Platform-by-platform breakdown (ChatGPT, Claude, Gemini, Perplexity)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Schema gaps and auto-fix recommendations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Competitor analysis for your market
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              30-day visibility improvement roadmap
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-gray-900 to-blue-900/30 rounded-xl border border-purple-500/30 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Lock className="w-8 h-8 text-purple-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Unlock Your Full Report</h2>
          <p className="text-gray-400">Choose one option to reveal detailed insights</p>
        </div>
      </div>

      {/* Preview of locked content */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/80 to-gray-900 z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-semibold">Locked Content Below</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 blur-sm">
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-5/6" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="h-24 bg-gray-700 rounded" />
              <div className="h-24 bg-gray-700 rounded" />
              <div className="h-24 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Share Option */}
        <div
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedMethod === 'share'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-700 hover:border-purple-500/50'
          }`}
          onClick={() => setSelectedMethod('share')}
        >
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Share & Unlock</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Share your results on social media to unlock the full report instantly
          </p>

          {selectedMethod === 'share' && (
            <div className="space-y-3 mt-4">
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-3 px-4 rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5" />
                Share on Twitter
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white py-3 px-4 rounded-lg transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                Share on LinkedIn
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#0c64d6] text-white py-3 px-4 rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Share on Facebook
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Email Option */}
        <div
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedMethod === 'email'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-700 hover:border-purple-500/50'
          }`}
          onClick={() => setSelectedMethod('email')}
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Email Me the Report</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Get your full report + 30-day improvement plan delivered to your inbox
          </p>

          {selectedMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Email Me the Report →'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Instant access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>2,847 unlocked this month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
