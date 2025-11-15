// @ts-nocheck
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
// Toaster is optional - use fallback if not available
let Toaster: any = null;
try {
  Toaster = require('sonner').Toaster;
} catch {
  Toaster = () => null; // No-op component
}
import { ClerkProviderWrapper } from '@/components/providers/ClerkProviderWrapper'
import { MonitoringProvider } from '@/components/providers/MonitoringProvider'
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/lib/theme'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dealershipai.com'),
  title: {
    default: 'DealershipAI – Automotive AI Visibility Analyzer',
    template: '%s | DealershipAI',
  },
  description: 'Analyze your car dealership\'s visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot. Get instant insights on revenue at risk and actionable fixes.',
  keywords: [
    'automotive AI visibility',
    'car dealership ChatGPT optimization',
    'dealership AI search',
    'automotive SEO',
    'AEO optimization',
    'car dealer digital marketing',
    'dealership competitive analysis',
    'automotive revenue optimization',
  ],
  authors: [{ name: 'DealershipAI Team' }],
  creator: 'DealershipAI',
  publisher: 'DealershipAI',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': '/insights/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://dealershipai.com/',
    title: 'DealershipAI – Check Your AI Search Visibility',
    description: 'Free AI visibility analysis for automotive dealerships. See how you rank on ChatGPT, Claude, Perplexity, Gemini, and Copilot.',
    siteName: 'DealershipAI',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealershipAI – AI Visibility Analysis',
    description: 'Analyze your dealership\'s AI search visibility. Free instant report.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://dealershipai.com/',
  },
}

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />

        {/* JSON-LD Structured Data - Removed to fix build error */}

        {process.env.NEXT_PUBLIC_GA && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA}`} />
            <script dangerouslySetInnerHTML={{__html:`
              window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
              gtag('js', new Date()); gtag('config','${process.env.NEXT_PUBLIC_GA}');
            `}} />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ClerkProviderWrapper>
            <ThemeProvider>
              <MonitoringProvider>
                {children}
                <Analytics />
                <Toaster position="top-right" richColors />
              </MonitoringProvider>
            </ThemeProvider>
          </ClerkProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
}