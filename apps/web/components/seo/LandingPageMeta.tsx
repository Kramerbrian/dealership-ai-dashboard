'use client';

import { useEffect } from 'react';

export default function LandingPageMeta() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update title
    document.title = 'DealershipAI - Automotive AI Visibility Analysis | ChatGPT Search Optimization';

    // Primary Meta Tags
    updateMeta('title', 'DealershipAI - Automotive AI Visibility Analyzer');
    updateMeta('description', 'Analyze your car dealership\'s visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot. Get instant insights on revenue at risk and actionable fixes. Free analysis for automotive dealerships.');
    updateMeta('keywords', 'automotive AI visibility, car dealership ChatGPT optimization, dealership AI search, automotive SEO, AEO optimization, car dealer digital marketing, dealership competitive analysis, automotive revenue optimization');

    // Open Graph
    updateMeta('og:type', 'website', true);
    updateMeta('og:url', 'https://dealershipai.com/', true);
    updateMeta('og:title', 'DealershipAI - Check Your AI Search Visibility', true);
    updateMeta('og:description', 'Free AI visibility analysis for automotive dealerships. See how you rank on ChatGPT, Claude, Perplexity, Gemini, and Copilot.', true);
    updateMeta('og:image', 'https://dealershipai.com/og-image.png', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image', true);
    updateMeta('twitter:title', 'DealershipAI - AI Visibility Analysis', true);
    updateMeta('twitter:description', 'Analyze your dealership\'s AI search visibility. Free instant report.', true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://dealershipai.com/');
  }, []);

  return null;
}

