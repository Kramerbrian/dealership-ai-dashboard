'use client';

import { useEffect, useState } from 'react';
import { offlineManager } from '@/lib/pwa/offline-manager';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    offlineManager.registerServiceWorker();

    // Check if already installed
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(isStandalone);

      // Listen for install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        (window as any).deferredPrompt = e;
        setShowInstallPrompt(true);
      });

      // Check if app was installed
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        (window as any).deferredPrompt = null;
      });
    }
  }, []);

  const handleInstall = async () => {
    const installed = await offlineManager.showInstallPrompt();
    if (installed) {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    }
  };

  return (
    <>
      {children}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Install DealershipAI</h3>
                <p className="text-sm text-gray-600">Add to your home screen for quick access and offline functionality</p>
              </div>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleInstall}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Install App
            </button>
          </div>
        </div>
      )}
    </>
  );
}

