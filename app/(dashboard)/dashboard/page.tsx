'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import OrchestratorView from '@/components/cognitive/OrchestratorView';
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';
import QaiModal from '@/app/(dashboard)/components/metrics/QaiModal';
import EEATDrawer from '@/app/(dashboard)/components/metrics/EEATDrawer';
import AIGEOSchema from '@/components/SEO/AIGEOSchema';
import SocialShareButtons from '@/components/dashboard/SocialShareButtons';
import DealershipAIScoreCard from '@/components/dashboard/DealershipAIScoreCard';
import { OelCard } from '@/app/(dashboard)/components/metrics/OelCard';
import OelModal from '@/app/(dashboard)/components/metrics/OelModal';
import DiagnosticDashboard from '@/components/dashboard/DiagnosticDashboard';
import PulseInbox from '@/components/pulse/PulseInbox';

export const dynamic = 'force-dynamic';

function DashboardContent() {
  const { user, isLoaded } = useUser();
  const [showQai, setShowQai] = useState(false);
  const [showEEAT, setShowEEAT] = useState(false);
  const [showOel, setShowOel] = useState(false);
  // Get domain from user metadata or fallback
  const domain = (user.publicMetadata?.domain as string) || 
                 (user.publicMetadata?.dealershipUrl as string)?.replace(/^https?:\/\//, '') || 
                 'demo-dealership.com';

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/sign-in');
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Use dealerId from user metadata or default
  const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';
  const dealershipName = (user.publicMetadata?.dealershipName as string) || user.firstName || 'Your Dealership';

  return (
    <>
      <AIGEOSchema 
        mode="dashboard" 
        dealership={{
          name: dealershipName,
          url: `https://${domain}`,
          rating: 4.5,
          reviewCount: 100
        }}
      />
      <IntelligenceShell dealerId={dealerId} showCognitionBar={true}>
        {/* Header with Social Share */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{dealershipName}</h1>
            <p className="text-gray-400 mt-1">{domain}</p>
          </div>
          <SocialShareButtons 
            dealership={{
              name: dealershipName,
              domain,
              scores: {
                vai: 87.3,
                qai: 87,
                trust: 92
              }
            }}
          />
        </div>

        {/* Orchestrator View - AI CSO Status */}
        <div className="mb-8">
          <OrchestratorView dealerId={dealerId} />
        </div>

        {/* Pulse Decision Inbox - Inevitability Spec */}
        <div className="mb-8">
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Pulse Decision Inbox</h2>
                <p className="text-sm text-gray-400">Real-time insights requiring action</p>
              </div>
              <a
                href="/inevitability"
                className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                🧠 View Spec
              </a>
            </div>
            <div style={{ height: '500px' }}>
              <PulseInbox dealerId={dealerId} autoRefresh={true} />
            </div>
          </div>
        </div>

        {/* Real-Time Diagnostic Dashboard */}
        <div className="mb-8">
          <DiagnosticDashboard domain={domain} dealerId={dealerId} />
        </div>

      {/* AIVATI AI Visibility Metrics */}
      <div className="mb-8">
        <DealershipAIScoreCard 
          origin={`https://${domain}`}
          dealerId={dealerId}
          autoRefresh={true}
          refreshInterval={300000}
        />
      </div>

      {/* Clay UX: Primary Metric + Two Secondary */}
      <div className="mb-8">
        {/* Primary Metric - Hero */}
        <div className="mb-6">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl p-8 text-center">
            <div className="text-sm font-medium text-gray-400 mb-2">AI Visibility Index</div>
            <div className="text-6xl font-black text-emerald-400 mb-2 tabular-nums">87.3</div>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+2.3% this month</span>
            </div>
            <p className="text-gray-400 mt-3 text-sm">Your dealership's AI search visibility score</p>
          </div>
        </div>

        {/* Secondary Metrics - Two Max (Clay Principle) */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="rounded-xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-5 cursor-pointer hover:bg-gray-900/70 transition-colors"
            onClick={() => setShowQai(true)}
          >
            <div className="text-xs font-medium text-gray-400 mb-1">ChatGPT</div>
            <div className="text-3xl font-bold text-blue-400 tabular-nums">94</div>
            <div className="text-xs text-gray-500 mt-1">Click for details</div>
          </div>
          
          <div className="rounded-xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-5">
            <div className="text-xs font-medium text-gray-400 mb-1">Perplexity</div>
            <div className="text-3xl font-bold text-purple-400 tabular-nums">82</div>
            <div className="text-xs text-gray-500 mt-1">Good visibility</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics - Collapsible (Progressive Disclosure) */}
      <div className="mb-8">
        <OelCard domain={domain} onOpen={() => setShowOel(true)} />
      </div>


      {/* Zero-Click Rate Intelligence Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Zero-Click Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ZeroClickCard tenantId={dealerId} />
          <AiriCard tenantId={dealerId} />
        </div>
      </div>

      {/* QAI Modal and EEAT Drawer */}
      {showQai && (
        <QaiModal
          domain={domain}
          open={showQai}
          onClose={() => setShowQai(false)}
          onOpenEEAT={() => setShowEEAT(true)}
        />
      )}
      {showEEAT && (
        <EEATDrawer
          domain={domain}
          open={showEEAT}
          onClose={() => setShowEEAT(false)}
        />
      )}
      {showOel && (
        <OelModal
          domain={domain}
          open={showOel}
          onClose={() => setShowOel(false)}
        />
      )}
    </IntelligenceShell>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
