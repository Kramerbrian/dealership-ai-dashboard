import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ClerkProviderWrapper } from '@/components/providers/ClerkProviderWrapper'
import { MonitoringProvider } from '@/components/providers/MonitoringProvider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'DealershipAI - AI Visibility Intelligence for Automotive Dealerships',
  description: 'Discover your AI visibility score across ChatGPT, Claude, Gemini, and Perplexity. Track Zero-Click rates, UGC health, and competitive intelligence.',
  keywords: ['dealership', 'AI', 'visibility', 'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'zero-click', 'automotive', 'marketing'],
  authors: [{ name: 'DealershipAI Team' }],
  creator: 'DealershipAI',
  publisher: 'DealershipAI',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'DealershipAI - AI Visibility Intelligence',
    description: 'Discover your AI visibility score across ChatGPT, Claude, Gemini, and Perplexity.',
    type: 'website',
    locale: 'en_US',
    url: 'https://dealershipai.com',
    siteName: 'DealershipAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealershipAI - AI Visibility Intelligence',
    description: 'Discover your AI visibility score across ChatGPT, Claude, Gemini, and Perplexity.',
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
        <ClerkProviderWrapper>
          <MonitoringProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </MonitoringProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  )
}