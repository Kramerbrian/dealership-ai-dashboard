"use client";

// Landing page with Clerk SSO CTAs.
// Provides SignUp and SignIn buttons with witty, subtle references.

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to DealershipAI</h1>
      {!isSignedIn ? (
        <>
          <SignUpButton redirectUrl="/onboarding" mode="modal">
            <button className="cta">Create Account</button>
          </SignUpButton>
          <SignInButton redirectUrl="/dashboard" mode="modal">
            <button className="cta">Sign In</button>
          </SignInButton>
        </>
      ) : (
        <>
          <p>You’re signed in!</p>
          <UserButton />
        </>
      )}
    </main>
  );
}