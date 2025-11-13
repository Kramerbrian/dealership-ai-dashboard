import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Visibility Scan - DealershipAI | 3-Second Dealership Analysis",
  description:
    "Get your free AI visibility report in 3 seconds. See how your dealership ranks on ChatGPT, Claude, Perplexity & Gemini. Identify revenue at risk and get instant fixes.",
  keywords: [
    "AI visibility",
    "dealership SEO",
    "zero-click search",
    "automotive marketing",
    "ChatGPT visibility",
    "dealership AI",
    "car dealer SEO",
    "AI search optimization",
  ],
  authors: [{ name: "DealershipAI" }],
  creator: "DealershipAI",
  publisher: "DealershipAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dealershipai.com/instant",
    title: "Free 3-Second AI Visibility Scan for Dealerships",
    description:
      "See how your dealership looks to AI. Get your zero-click score, AI visibility across 4 platforms, and revenue at risk—all in 3 seconds. Free instant report.",
    siteName: "DealershipAI",
    images: [
      {
        url: "/og-image-instant.png", // TODO: Create this image
        width: 1200,
        height: 630,
        alt: "DealershipAI Instant Analyzer - Free AI Visibility Scan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Visibility Scan - Get Your Report in 3 Seconds",
    description:
      "See how your dealership ranks on ChatGPT, Claude, Perplexity & Gemini. Identify revenue at risk. Free instant analysis.",
    images: ["/og-image-instant.png"],
    creator: "@DealershipAI",
  },
  alternates: {
    canonical: "https://dealershipai.com/instant",
  },
  other: {
    "google-site-verification": "YOUR_VERIFICATION_CODE", // TODO: Add from Google Search Console
  },
};
