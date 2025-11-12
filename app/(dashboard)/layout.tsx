'use client';

import { useEffect, useState } from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { CommandPalette } from '@/components/ui/command-palette'
import { AIChatWidget } from '@/components/ui/ai-chat-widget'
import OnboardingGuard from '@/components/onboarding/OnboardingGuard'
import SystemOnlineOverlay from '@/components/SystemOnlineOverlay'
import { BrandColorProvider } from '@/contexts/BrandColorContext'

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = useUser();
  const [showSystemOnline, setShowSystemOnline] = useState(false);

  // Get dealer domain from user metadata
  const dealerDomain = user?.publicMetadata?.dealer as string | undefined;
  const onboardingComplete = user?.publicMetadata?.onboardingComplete === true;
  const userName = user?.firstName || 'Dealer';

  useEffect(() => {
    // Show System Online overlay only for returning users who completed onboarding
    if (onboardingComplete) {
      const lastVisit = localStorage.getItem('lastDashboardVisit');
      const now = Date.now();

      if (lastVisit) {
        const timeSinceLastVisit = now - parseInt(lastVisit, 10);
        // Show if user was away for more than 5 minutes
        if (timeSinceLastVisit > 5 * 60 * 1000) {
          setShowSystemOnline(true);
        }
      }

      localStorage.setItem('lastDashboardVisit', now.toString());
    }
  }, [onboardingComplete]);

  return (
    <BrandColorProvider dealer={dealerDomain}>
      <OnboardingGuard>
        <>
          {/* System Online overlay for returning users */}
          {showSystemOnline && (
            <SystemOnlineOverlay
              userName={userName}
              dealer={dealerDomain || 'your-dealership.com'}
              durationMs={1200}
            />
          )}

          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-blue-600 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}

          {/* Growth Engine Components */}
          <CommandPalette />
          <AIChatWidget
            context={{
              dealership: {
                name: dealerDomain || 'Demo Dealership',
                id: user?.id || 'demo-123',
                aiScore: 87.3,
                location: (user?.publicMetadata?.location as string) || 'Naples, FL'
              },
              currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
              recentActivity: ['Completed audit', 'Added competitor', 'Fixed schema']
            }}
          />
        </>
      </OnboardingGuard>
    </BrandColorProvider>
  )
}
