// Cinematic Landing Page - Christopher Nolan Inspired
"use client";
import CinematicLandingPage from "@/components/landing/CinematicLandingPage";
import AIGEOSchema from "@/components/SEO/AIGEOSchema";
import LandingPageMeta from "@/components/SEO/LandingPageMeta";

// JSON-LD SEO Components
function JsonLd({ children }: { children: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: children }} />;
}

const SoftwareApplicationLd = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DealershipAI',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Analytics',
  operatingSystem: 'Web Browser',
  offers: { '@type':'Offer', price:'0', priceCurrency:'USD', description:'Free AI visibility analysis' },
  description: 'AI visibility analysis tool for automotive dealerships. Analyzes presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot.',
  featureList: [
    'ChatGPT visibility analysis',
    'Claude AI ranking check',
    'Perplexity search optimization',
    'Gemini presence audit',
    'Microsoft Copilot visibility',
    'Competitive analysis',
    'Revenue impact calculation'
  ],
  screenshot: 'https://dealershipai.com/screenshot.png',
  aggregateRating: { '@type':'AggregateRating', ratingValue:'4.9', ratingCount:'847' },
  publisher: {
    '@type':'Organization', name:'DealershipAI', url:'https://dealershipai.com', logo:'https://dealershipai.com/logo.png'
  }
});

const FaqLd = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type':'Question', name:'How do I check my dealership\'s AI search visibility?', acceptedAnswer: { '@type':'Answer', text:'Use DealershipAI\'s free instant analyzer to check your visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot. Enter your domain and get results in 10 seconds.' } },
    { '@type':'Question', name:'What is AI search optimization for dealerships?', acceptedAnswer: { '@type':'Answer', text:'AI search optimization (AEO) ensures your dealership appears in AI-powered search results from ChatGPT, Claude, Perplexity, and other AI assistants. It\'s critical for modern car dealership marketing.' } },
    { '@type':'Question', name:'How much revenue am I losing from poor AI visibility?', acceptedAnswer: { '@type':'Answer', text:'Average dealerships lose $43,000/month in potential sales from poor AI search visibility. DealershipAI\'s analysis shows your exact revenue at risk.' } }
  ]
});

export default function Landing() {
  return (
    <>
      <AIGEOSchema mode="landing" />
      <LandingPageMeta />
      <JsonLd>{SoftwareApplicationLd()}</JsonLd>
      <JsonLd>{FaqLd()}</JsonLd>
      <CinematicLandingPage />
    </>
  );
}
