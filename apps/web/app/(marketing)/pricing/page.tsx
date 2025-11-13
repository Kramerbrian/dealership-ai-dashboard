'use client';

import dynamic from 'next/dynamic';

export const dynamicConfig = 'force-dynamic';

const PricingPage = dynamic(() => import('@/components/pricing/PricingPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading pricing...</div>
    </div>
  ),
});

export default function Pricing() {
  return <PricingPage />;
}
