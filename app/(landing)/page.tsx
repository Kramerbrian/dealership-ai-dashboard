'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export interface InstantScore {
  overall: number;
  aiVisibility: number;
  zeroClick: number;
  ugcHealth: number;
  geoTrust: number;
  sgpIntegrity: number;
  competitorRank: number;
  totalCompetitors: number;
  revenueAtRisk: number;
}

// Mock components
function InstantAnalyzer({ onAnalyzed }: { onAnalyzed: (score: InstantScore) => void }) {
  return (
    <div className="py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">AI Visibility Intelligence</h1>
      <p className="text-gray-600 mb-8">Analyzing your dealership...</p>
      <button 
        onClick={() => onAnalyzed({
          overall: 85,
          aiVisibility: 78,
          zeroClick: 92,
          ugcHealth: 88,
          geoTrust: 91,
          sgpIntegrity: 89,
          competitorRank: 3,
          totalCompetitors: 12,
          revenueAtRisk: 45000
        })}
        className="px-6 py-3 bg-black text-white rounded-xl"
      >
        Analyze Now
      </button>
    </div>
  );
}

function InstantResults({ score, onUnlock }: { score: InstantScore; onUnlock: (feature: string) => void }) {
  const handleUnlock = () => {
    onUnlock('premium_features');
  };
  
  return (
    <div className="py-12 text-center">
      <h2 className="text-3xl font-bold mb-4">Your AI Visibility Score</h2>
      <div className="text-6xl font-bold text-green-600 mb-4">{score.overall}</div>
      <p className="text-gray-600 mb-4">Out of 100</p>
      <button 
        onClick={handleUnlock}
        className="px-6 py-3 bg-black text-white rounded-xl"
      >
        Unlock Premium Features
      </button>
    </div>
  );
}

function ShareToUnlockModal({ isOpen, onClose, onShared, featureName }: { isOpen: boolean; onClose: () => void; onShared: () => void; featureName: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Unlock {featureName}</h3>
        <p className="text-gray-600 mb-4">Share to unlock this feature</p>
        <button onClick={onClose} className="px-4 py-2 border rounded-xl">Close</button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useUser();
  const [currentScore, setCurrentScore] = useState<InstantScore | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFeature, setShareFeature] = useState('');

  const handleUnlock = (feature: string) => {
    setShareFeature(feature);
    setShareModalOpen(true);
  };

  const handleShared = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_unlock', { feature: shareFeature });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-black grid place-items-center text-white text-xs font-semibold">ai</div>
            <div className="text-lg font-semibold">dealership<span className="font-normal">AI</span></div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#audit">Quick Audit</a><a href="#pricing">Pricing</a><a href="#explainers">AEO · SEO · GEO</a>
          </nav>
          {user ? <a href="/dashboard" className="px-4 py-2 rounded-xl bg-black text-white text-sm">Dashboard</a> : <a href="/sign-in" className="px-4 py-2 rounded-xl border text-sm">Sign in</a>}
        </div>
      </header>

      {!currentScore ? <InstantAnalyzer onAnalyzed={setCurrentScore} /> : <InstantResults score={currentScore} onUnlock={handleUnlock} />}

      <ShareToUnlockModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} onShared={handleShared} featureName={shareFeature} />

      <section className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-gray-400 mb-6">Trusted by forward-thinking dealerships</p>
          <div className="flex items-center justify-center gap-12 opacity-50">
            <div className="text-xl font-bold">Terry Reid Hyundai</div>
            <div className="text-xl font-bold">Germain Auto</div>
            <div className="text-xl font-bold">Crown Motors</div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-6 text-sm">
          <div><div className="text-lg font-semibold mb-2">dealership<span className="font-normal">AI</span></div><p className="text-gray-600">Bloomberg-grade control panel</p></div>
          <div><div className="font-medium mb-2">Product</div><ul className="space-y-1 text-gray-600"><li><a href="#explainers">AEO · SEO · GEO</a></li><li><a href="#pricing">Pricing</a></li></ul></div>
          <div><div className="font-medium mb-2">Company</div><ul className="space-y-1 text-gray-600"><li><a href="/privacy">Privacy</a></li><li><a href="/terms">Terms</a></li></ul></div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} DealershipAI</div>
      </footer>
    </main>
  );
}
