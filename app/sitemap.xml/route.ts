/**
 * Dynamic Sitemap Generator
 *
 * Generates XML sitemap for search engines and AI crawlers.
 * Updates automatically with new pages.
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com';

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { url: '/dashboard', priority: '0.8', changefreq: 'daily' },
    { url: '/onboarding', priority: '0.8', changefreq: 'weekly' },
    { url: '/sign-in', priority: '0.5', changefreq: 'monthly' },
    { url: '/sign-up', priority: '0.5', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate',
    },
  });
}
