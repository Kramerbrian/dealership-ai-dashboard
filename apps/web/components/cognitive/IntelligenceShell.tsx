/**
 * Intelligence Shell - Apple-Park glass aesthetic container
 * The unified cognitive control center wrapper
 */

'use client';

import { ReactNode } from 'react';
import CognitionBar from './CognitionBar';
import { getPersonalityCopy } from '@/lib/cognitive-personality';

interface IntelligenceShellProps {
  children: ReactNode;
  dealerId?: string;
  showCognitionBar?: boolean;
}

export default function IntelligenceShell({
  children,
  dealerId = 'default',
  showCognitionBar = true,
}: IntelligenceShellProps) {
  const headerCopy = getPersonalityCopy('header');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      {/* Cognition Bar */}
      {showCognitionBar && <CognitionBar dealerId={dealerId} />}

      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                DealershipAI — Algorithmic Trust Dashboard
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{headerCopy.primary}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Live Feed Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {children}
      </main>

      {/* Footer - Cognitive Ops Platform Doctrine */}
      <footer className="mt-16 border-t border-white/10 bg-gray-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-gray-500 text-center">
            DealershipAI is a Cognitive Ops Platform — each rooftop operates with an embedded AI
            Chief Strategy Officer that continuously audits, predicts, fixes, and explains its own
            decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

