/**
 * JsonLd Wrapper Component
 *
 * Renders structured data JSON-LD blocks for SEO and AI crawlers.
 * Used to help ChatGPT, Claude, Perplexity, Gemini understand our content.
 */

import React from 'react';

interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
