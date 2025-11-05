'use client';

import React, { useState } from 'react';

interface PLGUpsellCardProps {
  id: string;
  title: string;
  offer_text: string;
  cta: string;
  api: string;
}

/**
 * PLG Upsell Card Component
 * Displays personalized product recommendations during onboarding
 */
export default function PLGUpsellCard({ id, title, offer_text, cta, api }: PLGUpsellCardProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upsell_id: id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle success (e.g., redirect, show confirmation)
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        }
      }
    } catch (error) {
      console.error('Upsell action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upsellCard">
      <h5>{title}</h5>
      <p>{offer_text}</p>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : cta}
      </button>
    </div>
  );
}

