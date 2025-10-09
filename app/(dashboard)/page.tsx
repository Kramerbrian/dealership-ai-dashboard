import { Suspense } from 'react';
import { DealershipAIDashboard } from '@/components/DealershipAIDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Dashboard...</p>
          </div>
        </div>
      }>
        <DealershipAIDashboard />
      </Suspense>
    </div>
  );
}