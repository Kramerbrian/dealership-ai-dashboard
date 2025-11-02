import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProviderWrapper } from '@/app/components/ClerkProviderWrapper'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
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
          {children}
        </ClerkProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}