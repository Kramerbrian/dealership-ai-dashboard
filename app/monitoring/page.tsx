'use client';

import { AEMDMonitoringDashboard } from '@/components/dashboard/AEMDMonitoringDashboard';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MonitoringContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenant') || 'demo-tenant';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AEMD Monitoring</h1>
        <p className="text-gray-600">
          AI Economic Metric Dashboard & Accuracy Monitoring System
        </p>
      </div>

      <AEMDMonitoringDashboard tenantId={tenantId} />
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MonitoringContent />
    </Suspense>
  );
}
