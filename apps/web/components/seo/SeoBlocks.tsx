export function SoftwareApplicationLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DealershipAI",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "499",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  });
}

export function FaqLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DealershipAI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DealershipAI tracks your dealership's visibility across AI platforms like ChatGPT, Perplexity, and Gemini."
        }
      },
      {
        "@type": "Question",
        "name": "How much does it cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a free scan, with paid plans starting at $499/month."
        }
      }
    ]
  });
}

export function HowToLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Track AI Visibility for Your Dealership",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Enter your website URL",
        "text": "Enter your dealership website URL to get started."
      },
      {
        "@type": "HowToStep",
        "name": "Get instant analysis",
        "text": "Our AI scans your site and provides a comprehensive Trust Score."
      },
      {
        "@type": "HowToStep",
        "name": "View your report",
        "text": "See detailed insights on schema, freshness, and AI visibility."
      }
    ]
  });
}

