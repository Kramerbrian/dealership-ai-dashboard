'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import OrchestratorView from '@/components/cognitive/OrchestratorView';
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';
import QaiModal from '@/app/(dashboard)/components/metrics/QaiModal';
import EEATDrawer from '@/app/(dashboard)/components/metrics/EEATDrawer';
import ConversationalAgent from '@/components/elevenlabs/ConversationalAgent';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [showQai, setShowQai] = useState(false);
  const [showEEAT, setShowEEAT] = useState(false);
  const domain = 'demo-dealership.com'; // In production, get from user metadata

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

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={true}>
      {/* Orchestrator View - AI CSO Status */}
      <div className="mb-8">
        <OrchestratorView dealerId={dealerId} />
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">AI Visibility Score</h2>
          <div className="text-3xl font-bold text-emerald-400">87.3%</div>
          <p className="text-gray-400 mt-2 text-sm">Your current AI visibility score</p>
        </div>
        
        <div 
          className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6 cursor-pointer hover:bg-gray-900/70 transition-colors"
          onClick={() => setShowQai(true)}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quality Authority Index</h2>
          <div className="text-3xl font-bold text-blue-400">87</div>
          <p className="text-gray-400 mt-2 text-sm">Click to view QAI breakdown</p>
        </div>
        
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Scans</h2>
          <div className="text-3xl font-bold text-purple-400">24</div>
          <p className="text-gray-400 mt-2 text-sm">AI scans completed this month</p>
        </div>
      </div>

      {/* ElevenLabs Conversational Agent */}
      <div className="mb-8">
        <ConversationalAgent />
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
    </IntelligenceShell>
  );
}
