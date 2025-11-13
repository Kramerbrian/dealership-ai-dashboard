'use client';
import React, { useState } from 'react';

export default function ShareUnlockModal({ 
  open, 
  onClose, 
  featureName 
}: { 
  open: boolean; 
  onClose: () => void; 
  featureName: string; 
}) {
  const [shared, setShared] = useState(false);
  const shareText = `I just checked our dealership's AI visibility with DealershipAI — found real revenue at risk. Try it free: https://dealershipai.com`;

  const doShare = async (platform: 'twitter' | 'linkedin') => {
    const url = platform === 'twitter'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://dealershipai.com')}`;
    
    window.open(url, '_blank');
    setShared(true);
    
    // Track telemetry
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'share_unlock',
          payload: { platform, featureName }
        })
      });
    } catch (e) {
      console.warn('Telemetry failed:', e);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-2xl font-black mb-2">Unlock {featureName}</div>
          <p className="text-gray-600 mt-2 mb-4">
            Share your result to unlock this feature instantly, or close to continue.
          </p>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => doShare('twitter')}
              className="px-4 py-3 rounded-xl text-white font-semibold bg-[#1DA1F2] hover:opacity-90 transition-opacity"
            >
              Share on X
            </button>
            <button
              onClick={() => doShare('linkedin')}
              className="px-4 py-3 rounded-xl text-white font-semibold bg-[#0A66C2] hover:opacity-90 transition-opacity"
            >
              Share on LinkedIn
            </button>
          </div>

          {shared && (
            <div className="mt-4 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
              ✅ Unlocked! Refresh the section to see full details.
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 rounded-xl border w-full hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

