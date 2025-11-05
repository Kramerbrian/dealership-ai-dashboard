'use client';

import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Dynamically import the dashboard component for code splitting
const DealershipAIDashboardLA = dynamic(
  () => import('@/app/components/DealershipAIDashboardLA'),
  {
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading dashboard...</div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Dashboard Page
 * 
 * Renders the main DealershipAI dashboard component.
 * Protected by Clerk middleware - requires authentication.
 */
export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

  return <DealershipAIDashboardLA />;
}
