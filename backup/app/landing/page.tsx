'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import EnhancedLandingPage from '@/app/components/landing/EnhancedLandingPage';

export default function LandingPage() {
  const router = useRouter();

  const handleAnalyze = (url: string) => {
    // Redirect to dashboard with URL for analysis
    router.push(`/dashboard?url=${encodeURIComponent(url)}&analyzed=true`);
  };

  const handleRegister = () => {
    // Redirect to Clerk-managed sign-up page
    router.push('/sign-up');
  };

  const handleSaveProfile = (profile: { name: string; url: string }) => {
    // Save profile via API (placeholder for future implementation)
    // TODO: Implement profile API endpoint
    alert(`Profile saved: ${profile.name} - ${profile.url}`);
  };

  return (
    <EnhancedLandingPage
      onAnalyze={handleAnalyze}
      onRegister={handleRegister}
      onSaveProfile={handleSaveProfile}
    />
  );
}