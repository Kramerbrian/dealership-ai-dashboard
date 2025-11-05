'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Join DealershipAI
          </h2>
          <p className="text-gray-400">
            Start your free trial and transform your dealership with AI
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-slate-900/50 border border-purple-500/30 backdrop-blur-xl',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500',
                formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
                formFieldInput: 'bg-slate-800 border-purple-500/30 text-white',
                formFieldLabel: 'text-gray-300',
                footerActionLink: 'text-purple-400 hover:text-purple-300',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
