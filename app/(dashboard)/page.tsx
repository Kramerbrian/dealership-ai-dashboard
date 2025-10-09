import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardConfig } from '@/lib/rbac';
import { EnterpriseDashboard } from '@/components/EnterpriseDashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardConfig = getDashboardConfig(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Enterprise Dashboard...</p>
          </div>
        </div>
      }>
        <EnterpriseDashboard 
          user={user} 
          config={dashboardConfig}
        />
      </Suspense>
    </div>
  );
}