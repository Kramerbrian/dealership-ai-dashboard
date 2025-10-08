import { getCurrentUser } from '@/lib/auth';
import { api } from '@/lib/trpc/server';
import { generateDashboardHTML } from '@/lib/dashboard-embed';
import { DashboardWithAIClient } from '../../components/DashboardWithAIClient';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Get dashboard data based on user role and tenant
  const data = await api.dealership.getDashboard.query({
    tenantId: user.tenant?.id,
    accessibleTenants: [user.tenant_id]
  });

  // Calculate revenue at risk (simple calculation - adjust for your needs)
  const revenueAtRisk = calculateRevenueAtRisk(data);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dealership Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user.name}! Here's your AI visibility overview.
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Overall Score</p>
            <p className="text-2xl font-bold text-blue-600">
              {data.overall_score || 0}/100
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">AI Visibility</p>
            <p className="text-2xl font-bold text-green-600">
              {data.ai_visibility || 0}/100
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Zero-Click</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.seo_score || 0}/100
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Review Health</p>
            <p className="text-2xl font-bold text-yellow-600">
              {data.seo_score || 0}/100
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Local Trust</p>
            <p className="text-2xl font-bold text-indigo-600">
              {data.local_score || 0}/100
            </p>
          </div>
        </div>
      </div>

      {/* AI Assistant Section - Pass data to client component */}
      <DashboardWithAIClient
        initialData={{
          revenueAtRisk,
          aiVisibility: data.ai_visibility || 0,
          overallScore: data.overall_score || 0,
          seoScore: data.seo_score || 0,
          localScore: data.local_score || 0,
          dealershipName: user.tenant?.name || 'Your Dealership',
          userName: user.name || 'User'
        }}
      />

      {/* Embed your existing HTML dashboard */}
      <div className="bg-white rounded-lg shadow border mt-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Detailed Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive view of your dealership's AI visibility metrics
          </p>
        </div>

        <div className="h-[900px]">
          <iframe
            srcDoc={generateDashboardHTML(data)}
            className="w-full h-full border-0"
            title="Dealership Analytics Dashboard"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate revenue at risk based on AI visibility score
 * Adjust this formula based on your business model
 */
function calculateRevenueAtRisk(data: any): number {
  const aiVisibility = data.ai_visibility || 0;
  const baseRevenue = 500000; // Average annual dealership revenue from digital
  const riskFactor = (100 - aiVisibility) / 100;
  return Math.round(baseRevenue * riskFactor);
}