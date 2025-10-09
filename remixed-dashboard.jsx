import React, { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

/**
 * Next.js page that serves the remixed dashboard HTML.  It fetches the
 * static HTML from the public directory and renders it inside a
 * `dangerouslySetInnerHTML` block.  This allows you to host the
 * exported dashboard (remixed-b89ebd77.html) on the same domain with
 * Clerk authentication gating.  Ensure `public/remixed-dashboard.html`
 * exists in your project (we copied it earlier).
 */
export default function RemixedDashboardPage() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    // Fetch the static HTML file from the public folder.
    fetch('/remixed-dashboard.html')
      .then(res => res.text())
      .then(setHtml)
      .catch((err) => {
        console.error('Failed to load static dashboard:', err);
      });
  }, []);

  return (
    <>
      <SignedOut>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <h2>Please sign in to access your dashboard</h2>
            <SignInButton mode="modal" redirectUrl="/remixed-dashboard">Sign In</SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </SignedIn>
    </>
  );
}