import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

# AI crawlers
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}

