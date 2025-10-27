#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing Clerk Production Configuration...');

// 1. Update app/page.tsx to redirect to dashboard
const homePageContent = `import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
`;

fs.writeFileSync('app/page.tsx', homePageContent);
console.log('✅ Updated app/page.tsx - Fixed 404 redirect');

// 2. Update next.config.js for redirects
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
`;

fs.writeFileSync('next.config.js', nextConfigContent);
console.log('✅ Updated next.config.js - Added redirect configuration');

// 3. Verify app/layout.tsx has correct Clerk props
const layoutContent = `import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { CommandPalette } from '@/components/ui/command-palette'
import { AIChatWidget } from '@/components/ui/ai-chat-widget'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DealershipAI - Transform Your Dealership with AI-Powered Analytics',
  description: 'Get comprehensive AI-powered analytics for your dealership. Track SEO, social media, customer engagement, and boost your online presence with DealershipAI. Join 500+ dealerships already winning with AI.',
  keywords: ['dealership', 'AI', 'analytics', 'automotive', 'marketing', 'visibility', 'SEO', 'Google SGE', 'ChatGPT', 'Perplexity', 'AI search', 'local marketing', 'dealership marketing'],
  authors: [{ name: 'DealershipAI Team' }],
  creator: 'DealershipAI',
  publisher: 'DealershipAI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'DealershipAI - Transform Your Dealership with AI-Powered Analytics',
    description: 'Get comprehensive AI-powered analytics for your dealership. Track SEO, social media, customer engagement, and boost your online presence with DealershipAI.',
    type: 'website',
    locale: 'en_US',
    url: 'https://dealershipai.com',
    siteName: 'DealershipAI',
    images: [
      {
        url: 'https://dealershipai.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DealershipAI - AI-Powered Analytics for Dealerships',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealershipAI - Transform Your Dealership with AI-Powered Analytics',
    description: 'Get comprehensive AI-powered analytics for your dealership. Track SEO, social media, customer engagement, and boost your online presence.',
    images: ['https://dealershipai.com/twitter-image.jpg'],
    creator: '@dealershipai',
  },
  alternates: {
    canonical: 'https://dealershipai.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_GA && (
          <>
            <script async src={\`https://www.googletagmanager.com/gtag/js?id=\${process.env.NEXT_PUBLIC_GA}\`} />
            <script dangerouslySetInnerHTML={{__html:\`
              window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
              gtag('js', new Date()); gtag('config','\${process.env.NEXT_PUBLIC_GA}');
            \`}} />
          </>
        )}
      </head>
      <body className={\`\${inter.variable} antialiased\`}>
        <ClerkProvider
          fallbackRedirectUrl="/dashboard"
          signInUrl="/auth/signin"
          signUpUrl="/auth/signup"
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-blue-600 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
          
          {/* Growth Engine Components */}
          <CommandPalette />
          <AIChatWidget 
            context={{
              dealership: {
                name: 'Demo Dealership',
                id: 'demo-123',
                aiScore: 87.3,
                location: 'Naples, FL'
              },
              currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
              recentActivity: ['Completed audit', 'Added competitor', 'Fixed schema']
            }}
          />
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  )
}`;

fs.writeFileSync('app/layout.tsx', layoutContent);
console.log('✅ Updated app/layout.tsx - Fixed deprecated Clerk props');

// 4. Verify middleware.ts has correct configuration
const middlewareContent = `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/signin(.*)',
  '/auth/signup(.*)',
  '/pricing(.*)',
  '/test-auth(.*)',
  '/test-oauth(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}`;

fs.writeFileSync('middleware.ts', middlewareContent);
console.log('✅ Updated middleware.ts - Fixed Clerk middleware configuration');

console.log('🎉 Clerk production configuration fixed!');
console.log('');
console.log('📝 Next steps to complete the fix:');
console.log('1. 🔑 Get production Clerk keys from dashboard');
console.log('2. 🌐 Update Vercel environment variables:');
console.log('   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...');
console.log('   - CLERK_SECRET_KEY=sk_live_...');
console.log('3. 🏠 Configure domains in Clerk dashboard:');
console.log('   - Remove domains from dev instance');
console.log('   - Add domains to production instance');
console.log('4. 🚀 Redeploy to Vercel');
console.log('');
console.log('✅ This will fix:');
console.log('   - "Keyless mode" warnings');
console.log('   - 404 errors at root URL');
console.log('   - Deprecated Clerk prop warnings');
console.log('   - Authentication flow issues');
