'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import IntelligenceShell from '@/components/cognitive/IntelligenceShell';
import IntegrationMarketplace from '@/components/integrations/IntegrationMarketplace';

export default function IntegrationsPage() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/sign-in');
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const dealerId = (user.publicMetadata?.dealerId as string) || user.id || 'demo-tenant';

  return (
    <IntelligenceShell dealerId={dealerId} showCognitionBar={false}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Integration Marketplace</h1>
        <p className="text-gray-400">
          Connect your dealership data with external platforms to automate workflows and aggregate insights
        </p>
      </div>

      {/* Integration Marketplace Component */}
      <IntegrationMarketplace dealerId={dealerId} />

      {/* Integration Benefits */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-900/20 to-gray-800/50 border border-emerald-500/30 rounded-xl">
          <h3 className="font-semibold text-white mb-2">⭐ Review Aggregation</h3>
          <p className="text-sm text-gray-400 mb-3">
            Pull reviews from Google, Yelp, DealerRater, and more into one unified dashboard
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Automated sentiment analysis</li>
            <li>• Response management</li>
            <li>• Review trend tracking</li>
          </ul>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-900/20 to-gray-800/50 border border-blue-500/30 rounded-xl">
          <h3 className="font-semibold text-white mb-2">🚗 DMS Integration</h3>
          <p className="text-sm text-gray-400 mb-3">
            Sync inventory, customer data, and sales from CDK, Reynolds & Reynolds, and other DMS platforms
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Real-time inventory updates</li>
            <li>• Automated lead routing</li>
            <li>• Customer data sync</li>
          </ul>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-900/20 to-gray-800/50 border border-purple-500/30 rounded-xl">
          <h3 className="font-semibold text-white mb-2">📊 Analytics & CRM</h3>
          <p className="text-sm text-gray-400 mb-3">
            Connect analytics tools and CRM systems to enrich dealership intelligence
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Unified reporting</li>
            <li>• Customer journey tracking</li>
            <li>• Performance metrics</li>
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 p-6 bg-gray-800/30 border border-gray-700 rounded-xl">
        <h3 className="font-semibold text-white mb-4">Integration FAQ</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-200 mb-1">How do integrations work?</h4>
            <p className="text-sm text-gray-400">
              Integrations sync data between DealershipAI and external platforms on a scheduled basis (typically every 15-60 minutes). You can also trigger manual syncs at any time.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">Are my credentials secure?</h4>
            <p className="text-sm text-gray-400">
              Yes. All API keys and credentials are encrypted at rest and in transit. We follow industry best practices for secure credential management.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">What if an integration fails?</h4>
            <p className="text-sm text-gray-400">
              Integration health is monitored continuously. If a sync fails, you'll see an error message with details. Most issues are related to expired credentials or API rate limits and can be resolved quickly.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-200 mb-1">Can I disconnect an integration?</h4>
            <p className="text-sm text-gray-400">
              Yes, you can pause or disconnect any integration at any time. Historical data that was already synced will remain in your dashboard unless you choose to delete it.
            </p>
          </div>
        </div>
      </div>
    </IntelligenceShell>
  );
}
