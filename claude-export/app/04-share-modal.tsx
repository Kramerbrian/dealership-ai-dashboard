'use client';

import React, { useState, useEffect } from 'react';
import { Check, Twitter, Linkedin, Facebook, Copy, X } from 'lucide-react';
import { trackEvent, trackShare } from '@/lib/analytics';

export function ShareToUnlockModal({ 
  isOpen, 
  onClose, 
  onShared, 
  featureName 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onShared: () => void;
  featureName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      trackEvent('share_modal_opened', {
        feature_name: featureName
      });
    }
  }, [isOpen, featureName]);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Just discovered my AI visibility score with DealershipAI! See what AI says about your dealership. #AIvisibility #DealershipMarketing`;

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);
    
    let shareUrl_: string;
    
    switch (platform) {
      case 'twitter':
        shareUrl_ = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl_ = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'facebook':
        shareUrl_ = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl_, '_blank', 'width=600,height=400');
    setShared(true);
    
    // Track share
    trackShare(platform, featureName);
    
    // Track conversion
    trackEvent('share_completed', {
      platform,
      feature_name: featureName
    });
    
    onShared();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Share to Unlock</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!shared ? (
          <>
            <p className="text-gray-400 mb-6">
              Share your AI visibility discovery to unlock {featureName}. No cost, just spread the word!
            </p>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition font-medium"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </button>
              
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0077B5] text-white hover:bg-[#006ba1] transition font-medium"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5] transition font-medium"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </button>
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 h-12 px-4 rounded-xl bg-gray-950 border border-white/10 text-white text-sm"
              />
              <button
                onClick={handleCopy}
                className="h-12 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-600 grid place-items-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Thanks for sharing!</h4>
            <p className="text-gray-400 mb-6">
              Your {featureName} feature has been unlocked. Enjoy exclusive access for 24 hours.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
