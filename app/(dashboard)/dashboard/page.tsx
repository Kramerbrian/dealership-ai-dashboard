'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import OrchestratorView from '@/components/cognitive/OrchestratorView';
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';
import SchemaHealthCard from '@/components/pulse/SchemaHealthCard';
import DiagnosticDashboard from '@/components/dashboard/DiagnosticDashboard';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

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
  // Get domain from user metadata or fallback
  const domain = (user.publicMetadata?.domain as string) || 
                 (user.publicMetadata?.dealershipUrl as string)?.replace(/^https?:\/\//, '') || 
                 'demo-dealership.com';

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={true}>
      {/* Orchestrator View - AI CSO Status */}
      <div className="mb-8">
        <OrchestratorView dealerId={dealerId} />
      </div>

      {/* Real-Time Diagnostic Dashboard */}
      <div className="mb-8">
        <DiagnosticDashboard domain={domain} dealerId={dealerId} />
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">AI Visibility Score</h2>
          <div className="text-3xl font-bold text-emerald-400">87.3%</div>
          <p className="text-gray-400 mt-2 text-sm">Your current AI visibility score</p>
        </div>
        
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Competitors Tracked</h2>
          <div className="text-3xl font-bold text-blue-400">12</div>
          <p className="text-gray-400 mt-2 text-sm">Active competitor monitoring</p>
        </div>
        
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Scans</h2>
          <div className="text-3xl font-bold text-purple-400">24</div>
          <p className="text-gray-400 mt-2 text-sm">AI scans completed this month</p>
        </div>
      </div>

      {/* Schema Health & Zero-Click Intelligence Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Market Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SchemaHealthCard dealerId={dealerId} />
          <ZeroClickCard tenantId={dealerId} />
          <AiriCard tenantId={dealerId} />
        </div>
      </div>
    </IntelligenceShell>
  );
}
