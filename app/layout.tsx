import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ClerkProviderWrapper } from '@/components/providers/ClerkProviderWrapper'
import { MonitoringProvider } from '@/components/providers/MonitoringProvider'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  softwareApplicationSchema,
  organizationSchema,
  websiteSchema
} from '@/components/seo/SeoBlocks'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'DealershipAI - Cognitive Ops Platform | AI Chief Strategy Officer for Automotive Dealerships',
  description: 'The Cognitive Ops Platform for Automotive Leaders. Every dealer has an embedded AI Chief Strategy Officer that continuously audits, predicts, fixes, and explains decisions. When ChatGPT doesn't know you exist, you might as well be selling horse carriages.',
  keywords: ['dealership', 'AI', 'visibility', 'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'zero-click', 'automotive', 'marketing', 'cognitive ops', 'AI CSO', 'orchestrator'],
  authors: [{ name: 'DealershipAI Team' }],
  creator: 'DealershipAI',
  publisher: 'DealershipAI',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'DealershipAI - Cognitive Ops Platform | AI Chief Strategy Officer',
    description: 'The Cognitive Ops Platform for Automotive Leaders. Every dealer has an embedded AI Chief Strategy Officer that continuously audits, predicts, fixes, and explains decisions.',
    type: 'website',
    locale: 'en_US',
    url: 'https://dealershipai.com',
    siteName: 'DealershipAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealershipAI - Cognitive Ops Platform | AI Chief Strategy Officer',
    description: 'The Cognitive Ops Platform for Automotive Leaders. Every dealer has an embedded AI Chief Strategy Officer.',
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
        {/* JSON-LD Structured Data for AI Crawlers */}
        <JsonLd data={softwareApplicationSchema()} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />

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