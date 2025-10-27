'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function IntelligencePage() {
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
          AI Intelligence Center
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">QAI Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PIQR Score</span>
                <span className="font-semibold text-blue-600">92.1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">HRP Score</span>
                <span className="font-semibold text-green-600">0.12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">VAI Score</span>
                <span className="font-semibold text-purple-600">87.3</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitive Intelligence</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Market Position</span>
                <span className="font-semibold text-orange-600">#3 of 12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Threat Level</span>
                <span className="font-semibold text-red-600">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Opportunities</span>
                <span className="font-semibold text-green-600">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
