import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
// import { WorkOSProvider } from '@/app/components/WorkOSProvider' // Temporarily disabled for debugging
import { Analytics } from '@vercel/analytics/react'
import { WebVitalsTracker } from '@/components/WebVitalsTracker'
import { QueryProvider } from '@/components/QueryProvider'
import { PWAProvider } from '@/components/pwa/PWAProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;


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
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-JYQ9MZLCQW';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DealershipAI" />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `,
          }}
          // Add nonce to help with CSP if needed
          nonce={typeof window !== 'undefined' ? undefined : 'google-analytics'}
        />
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          domain={typeof window !== 'undefined' ? window.location.hostname : undefined}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
        >
          <QueryProvider>
            <PWAProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </PWAProvider>
          </QueryProvider>
        </ClerkProvider>
        <Analytics />
        <WebVitalsTracker />
      </body>
    </html>
  )
}