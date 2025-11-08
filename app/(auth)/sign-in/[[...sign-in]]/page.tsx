'use client';
import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Sign in to DealershipAI
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Access your AI-powered dealership analytics dashboard
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center text-white">Loading...</div>}>
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white',
                card: 'bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-purple-500/30',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'border border-gray-700 hover:bg-gray-700/50 bg-gray-800/50',
                socialButtonsBlockButtonText: 'text-white',
                formFieldInput: 'bg-gray-700/50 border-gray-600 rounded-lg px-4 py-3 text-white',
                footerActionLink: 'text-purple-400 hover:text-purple-300',
                formFieldLabel: 'text-gray-300',
                footerAction: 'text-gray-400',
              },
            }}
            redirectUrl="/onboarding"
            signUpUrl="/sign-up"
          />
        </Suspense>
      </div>
    </main>
  );
}

