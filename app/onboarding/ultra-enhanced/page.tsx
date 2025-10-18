/**
 * Ultra Enhanced Onboarding Page
 * Complete onboarding experience with all advanced features
 */

import UltraEnhancedOnboardingFlow from '@/components/onboarding/UltraEnhancedOnboardingFlow'
import { redirect } from 'next/navigation'

interface UltraEnhancedOnboardingPageProps {
  searchParams: {
    domain?: string
    step?: string
  }
}

export default function UltraEnhancedOnboardingPage({ searchParams }: UltraEnhancedOnboardingPageProps) {
  const { domain, step } = searchParams

  return (
    <UltraEnhancedOnboardingFlow
      initialDomain={domain}
      onComplete={() => {
        // Redirect to dashboard after completion
        redirect('/intelligence')
      }}
      onSkip={() => {
        // Redirect to dashboard if skipped
        redirect('/intelligence')
      }}
    />
  )
}
