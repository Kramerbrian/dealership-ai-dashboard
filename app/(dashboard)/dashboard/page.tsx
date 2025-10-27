'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/auth/signin');
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome to DealershipAI Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Visibility Score</h2>
            <div className="text-3xl font-bold text-blue-600">87.3%</div>
            <p className="text-gray-600 mt-2">Your current AI visibility score</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitors Tracked</h2>
            <div className="text-3xl font-bold text-green-600">12</div>
            <p className="text-gray-600 mt-2">Active competitor monitoring</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Scans</h2>
            <div className="text-3xl font-bold text-purple-600">24</div>
            <p className="text-gray-600 mt-2">AI scans completed this month</p>
          </div>
        </div>

        {/* Zero-Click Rate Intelligence Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Zero-Click Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ZeroClickCard tenantId={user?.id || 'demo-tenant'} />
            <AiriCard tenantId={user?.id || 'demo-tenant'} />
          </div>
        </div>
      </div>
    </div>
  );
}
