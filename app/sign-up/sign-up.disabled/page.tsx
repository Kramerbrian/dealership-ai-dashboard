'use client';

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
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
