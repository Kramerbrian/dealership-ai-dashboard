import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { TRPCProvider } from '@/lib/trpc';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DealershipAI - Dominate AI Search for Car Dealerships',
  description: 'The only AI visibility platform built specifically for car dealerships. Get cited by ChatGPT, Claude, and Perplexity when customers search for your services.',
  keywords: 'AI search, car dealership, ChatGPT, Claude, Perplexity, AI visibility, automotive marketing',
  authors: [{ name: 'DealershipAI Team' }],
  creator: 'DealershipAI',
  publisher: 'DealershipAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dash.dealershipai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DealershipAI - Dominate AI Search for Car Dealerships',
    description: 'The only AI visibility platform built specifically for car dealerships. Get cited by ChatGPT, Claude, and Perplexity when customers search for your services.',
    url: 'https://dash.dealershipai.com',
    siteName: 'DealershipAI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DealershipAI - AI Visibility Platform for Car Dealerships',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealershipAI - Dominate AI Search for Car Dealerships',
    description: 'The only AI visibility platform built specifically for car dealerships. Get cited by ChatGPT, Claude, and Perplexity when customers search for your services.',
    images: ['/og-image.jpg'],
    creator: '@dealershipai',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily disable Clerk for API integration testing
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = clerkKey && !clerkKey.includes('your_clerk_key_here');
  
  if (isClerkConfigured) {
    return (
      <ClerkProvider
        publishableKey={clerkKey}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
            card: 'shadow-lg border border-gray-200',
            headerTitle: 'text-gray-900',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
            socialButtonsBlockButtonText: 'text-gray-700',
            formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            footerActionLink: 'text-blue-600 hover:text-blue-700',
          },
        }}
      >
        <html lang="en" className="scroll-smooth">
          <head>
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
            <meta name="theme-color" content="#3b82f6" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body className={`${inter.className} antialiased`}>
            {children}
          </body>
        </html>
      </ClerkProvider>
    );
  }

  // Fallback layout without Clerk
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
