export const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.dealershipai.example/#org",
      "name": "dealershipAI",
      "url": "https://www.dealershipai.example/",
      "logo": "https://www.dealershipai.example/logo.png",
      "sameAs": ["https://www.linkedin.com/company/dealershipai"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.dealershipai.example/#website",
      "url": "https://www.dealershipai.example/",
      "name": "dealershipAI — Algorithmic Trust Dashboard",
      "publisher": { "@id": "https://www.dealershipai.example/#org" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.dealershipai.example/dashboard?dealer={dealer}",
        "query-input": "required name=dealer"
      }
    },
    {
      "@type": "SiteNavigationElement",
      "name": ["How it works","Results","Pricing","FAQ"],
      "url": [
        "https://www.dealershipai.example/#how",
        "https://www.dealershipai.example/#results",
        "https://www.dealershipai.example/#pricing",
        "https://www.dealershipai.example/#faq"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What signals power the score?",
          "acceptedAnswer": { "@type": "Answer", "text": "Live AI model checks plus public signals: schema, GBP, and site performance." }
        },
        {
          "@type": "Question",
          "name": "Will this replace my SEO agency?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. It augments SEO for AI surfaces and reduces ad waste." }
        },
        {
          "@type": "Question",
          "name": "How fast do results show up?",
          "acceptedAnswer": { "@type": "Answer", "text": "First lifts commonly appear within 30 days after fixes ship." }
        }
      ]
    }
  ]
};
