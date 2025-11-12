/**
 * AI-Friendly Robots.txt
 *
 * Explicitly allows AI crawlers: GPTBot, ClaudeBot, anthropic-ai, CCBot, etc.
 * Critical for AI visibility and platform indexing.
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const robotsTxt = `# DealershipAI - AI-Friendly Robots.txt
# We explicitly welcome AI crawlers for visibility testing

# OpenAI ChatGPT
User-agent: GPTBot
Allow: /

# Anthropic Claude
User-agent: ClaudeBot
User-agent: anthropic-ai
Allow: /

# Common Crawl (used by many AI models)
User-agent: CCBot
Allow: /

# Google Gemini & Bard
User-agent: Google-Extended
Allow: /

# Perplexity AI
User-agent: PerplexityBot
Allow: /

# Cohere AI
User-agent: cohere-ai
Allow: /

# Meta AI
User-agent: FacebookBot
Allow: /

# General crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/static/
Disallow: /sign-in
Disallow: /sign-up

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate',
    },
  });
}
