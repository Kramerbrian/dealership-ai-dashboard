/**
 * Marketing Layout
 * 
 * Layout for marketing pages (pricing, landing, etc.)
 * Shared layout with navigation and footer if needed
 */

import React from 'react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

