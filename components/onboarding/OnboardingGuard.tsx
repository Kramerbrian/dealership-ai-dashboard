'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Check onboarding status
    const onboardingComplete =
      user.publicMetadata?.onboardingComplete === true ||
      localStorage.getItem('onboarding_complete') === 'true';

    if (!onboardingComplete && !window.location.pathname.startsWith('/onboarding')) {
      router.push('/onboarding');
      return;
    }

    setChecking(false);
  }, [isLoaded, user, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

