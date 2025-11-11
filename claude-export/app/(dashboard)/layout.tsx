'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { CommandPalette } from '@/components/ui/command-palette'
import { AIChatWidget } from '@/components/ui/ai-chat-widget'
import OnboardingGuard from '@/components/onboarding/OnboardingGuard'

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // ClerkProvider is already in root layout, no need to duplicate here
  return (
    <OnboardingGuard>
      <>
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
            name: 'Demo Dealership',
            id: 'demo-123',
            aiScore: 87.3,
            location: 'Naples, FL'
          },
          currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
          recentActivity: ['Completed audit', 'Added competitor', 'Fixed schema']
        }}
      />
      </>
    </OnboardingGuard>
  )
}
