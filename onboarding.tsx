"use client";

// Onboarding page for new dealerships.
// Collects dealership name and domain, then redirects to the dashboard.

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function Onboarding() {
  const router = useRouter();
  const { user } = useUser();
  const [dealerName, setDealerName] = useState('');
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save dealerName/domain to your database here
    router.push('/dashboard');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Welcome, {user?.firstName || 'Dealer'}! Tell us about your dealership.</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          placeholder="Dealer Name"
          value={dealerName}
          onChange={e => setDealerName(e.target.value)}
          required
        />
        <input
          placeholder="Website Domain"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          required
        />
        <button type="submit">Get Started</button>
      </form>
    </div>
  );
}