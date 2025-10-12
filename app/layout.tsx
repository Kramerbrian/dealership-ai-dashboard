import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/lib/session-provider';
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

        {/* Theme initialization - prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const mode = saved ?? (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', mode==='dark');
})();
`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
