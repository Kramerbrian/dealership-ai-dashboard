import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DealershipAI Dashboard',
  description: 'AI-powered dashboard for automotive dealerships',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

