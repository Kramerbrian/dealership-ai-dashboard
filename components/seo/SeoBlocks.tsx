/**
 * SEO Blocks for Landing Page
 * Provides JSON-LD structured data functions
 */

export const SoftwareApplicationLd = () => ({
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

export const FaqLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type':'Question', name:'How do I check my dealership\'s AI search visibility?', acceptedAnswer: { '@type':'Answer', text:'Use DealershipAI\'s free instant analyzer to check your visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot. Enter your domain and get results in 10 seconds.' } },
    { '@type':'Question', name:'What is AI search optimization for dealerships?', acceptedAnswer: { '@type':'Answer', text:'AI search optimization (AEO) ensures your dealership appears in AI-powered search results from ChatGPT, Claude, Perplexity, and other AI assistants. It\'s critical for modern car dealership marketing.' } },
    { '@type':'Question', name:'How much revenue am I losing from poor AI visibility?', acceptedAnswer: { '@type':'Answer', text:'Average dealerships lose $43,000/month in potential sales from poor AI search visibility. DealershipAI\'s analysis shows your exact revenue at risk.' } }
  ]
});

export const HowToLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Analyze Your Dealership\'s AI Visibility',
  description: 'Step-by-step guide to checking your automotive dealership\'s visibility on AI search engines',
  step: [
    { '@type':'HowToStep', position: 1, name:'Enter Your Domain', text:'Go to DealershipAI.com and enter your dealership website domain' },
    { '@type':'HowToStep', position: 2, name:'Get Instant Analysis', text:'Receive your free AI visibility report in 10 seconds' },
    { '@type':'HowToStep', position: 3, name:'Review Issues', text:'See exactly what\'s costing you revenue and how to fix it' }
  ]
});

