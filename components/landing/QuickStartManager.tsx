'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp } from 'lucide-react';

interface QuickStartData {
  domain: string;
  timestamp: number;
  analysisCount: number;
}

const STORAGE_KEY = 'dealershipai_quickstart';
const STORAGE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export function useQuickStart() {
  const [quickStartData, setQuickStartData] = useState<QuickStartData | null>(null);

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: QuickStartData = JSON.parse(stored);
        // Check if data is still valid (not expired)
        const now = Date.now();
        if (now - data.timestamp < STORAGE_EXPIRY) {
          setQuickStartData(data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading quick start data:', error);
    }
  }, []);

  const saveQuickStart = (domain: string) => {
    try {
      const existing = quickStartData;
      const newData: QuickStartData = {
        domain,
        timestamp: Date.now(),
        analysisCount: existing ? existing.analysisCount + 1 : 1
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setQuickStartData(newData);
    } catch (error) {
      console.error('Error saving quick start data:', error);
    }
  };

  const clearQuickStart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuickStartData(null);
  };

  return {
    quickStartData,
    saveQuickStart,
    clearQuickStart,
    hasQuickStart: quickStartData !== null
  };
}

interface QuickStartBannerProps {
  domain: string;
  onUse: () => void;
  onDismiss: () => void;
}

export function QuickStartBanner({ domain, onUse, onDismiss }: QuickStartBannerProps) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Quick Start Available</h4>
            <p className="text-sm text-gray-600">
              Continue with <span className="font-medium">{domain}</span>?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Use This
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

