'use client';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to DealershipAI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your AI-powered dealership analytics dashboard
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center">Loading...</div>}>
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                card: 'bg-white shadow-lg border border-gray-200',
                headerTitle: 'text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                socialButtonsBlockButtonText: 'text-gray-700',
                formFieldInput: 'border border-gray-300 rounded-md px-3 py-2',
                footerActionLink: 'text-blue-600 hover:text-blue-700',
              },
            }}
            redirectUrl="/dash"
            signUpUrl="/sign-up"
          />
        </Suspense>
      </div>
    </div>
  );
}
