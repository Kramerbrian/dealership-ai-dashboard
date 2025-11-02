'use client';

// Force dynamic rendering to avoid SSR context issues

import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join DealershipAI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your free trial and transform your dealership with AI
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center">Loading...</div>}>
          <SignUp 
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
            redirectUrl="/onboarding"
            signInUrl="/sign-in"
          />
        </Suspense>
      </div>
    </div>
  );
}
