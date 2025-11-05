'use client';

/**
 * Example usage of OnboardingModal component
 * 
 * This demonstrates how to integrate the OnboardingModal with your onboarding flow.
 * The modal automatically adapts to dark/light theme based on the data-theme attribute.
 */

import React, { useState } from 'react';
import OnboardingModal, { Hovercard } from '../OnboardingModal';
import styles from '../../styles/onboardingModal.module.css';

export default function OnboardingModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  // Example baseline scores
  const baselines = [
    { metric: 'AI Visibility Index', value: 62, unit: '%' },
    { metric: 'Zero-Click Coverage', value: 45, unit: '%' },
    { metric: 'Review Trust Score', value: 78, unit: '%' },
    { metric: 'Schema Coverage', value: 85, unit: '%' },
  ];

  // Example competitors
  const competitors = [
    {
      name: 'Competitor A',
      rating: 4.5,
      reviewCount: 234,
      aiVisibility: 78,
      zeroClick: 62,
      sentiment: 82,
    },
    {
      name: 'Competitor B',
      rating: 4.3,
      reviewCount: 189,
      aiVisibility: 71,
      zeroClick: 58,
      sentiment: 75,
    },
    {
      name: 'Competitor C',
      rating: 4.7,
      reviewCount: 312,
      aiVisibility: 85,
      zeroClick: 71,
      sentiment: 88,
    },
  ];

  // Example PLG upsells
  const upsells = [
    {
      id: 'mystery-shop',
      title: 'Mystery Shop Analysis',
      description: 'Get a 360° competitive analysis across all AI platforms.',
      cta: 'Unlock for 24h',
      onClick: () => {
        console.log('Mystery Shop upsell clicked');
        // Trigger trial grant API
      },
    },
    {
      id: 'daily-focus',
      title: 'Daily Focus',
      description: 'Personalized action items based on your competitive landscape.',
      cta: 'Try Free',
      onClick: () => {
        console.log('Daily Focus upsell clicked');
      },
    },
  ];

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Onboarding Modal
      </button>

      <OnboardingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        baselines={baselines}
        competitors={competitors}
        upsells={upsells}
        title="Welcome to DealershipAI"
        theme="light" // or 'dark', or auto-detect from data-theme
      >
        {/* Custom content can be added here */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            Your dealership has been successfully onboarded. 
            <Hovercard metric="AI Visibility Index measures how easily your dealership can be found across search engines and AI assistants.">
              <span className={styles.hovercardTrigger}>ⓘ</span>
            </Hovercard>
          </p>
        </div>
      </OnboardingModal>
    </div>
  );
}

