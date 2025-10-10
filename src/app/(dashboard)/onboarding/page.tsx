/**
 * Onboarding Page
 * Auth-protected server component that renders the onboarding wizard
 */

import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { SessionProvider } from 'next-auth/react';

export default async function OnboardingPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/sign-in?callbackUrl=/onboarding');
  }

  // If user is already onboarded, redirect to dashboard
  if (session.user.onboarded) {
    redirect('https://dash.dealershipai.com');
  }

  return (
    <SessionProvider session={session}>
      <OnboardingWizard />
    </SessionProvider>
  );
}
