'use client';

import React from 'react';
import PulseInbox from '@/app/components/pulse/PulseInbox';

export default function PulsePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pulse — Decision Inbox</h1>
          <div className="text-sm text-gray-500">Turn signals into actions</div>
        </div>
        <PulseInbox />
      </div>
    </div>
  );
}

