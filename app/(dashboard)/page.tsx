import { Suspense } from 'react';
import { ConsolidatedDashboard } from '@/components/ConsolidatedDashboard';

export default function DashboardPage() {
  // Mock dealer ID - in production, get from user context
  const dealerId = 'dealer_123';

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading DealershipAI Dashboard...</p>
          </div>
        </div>
      }>
        <ConsolidatedDashboard dealerId={dealerId} />
      </Suspense>
    </div>
  );
}