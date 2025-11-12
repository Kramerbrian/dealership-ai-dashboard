import { NextResponse } from 'next/server';

// RSS feed data - in production, this would come from a CMS or database
const insights = [
  {
    slug: 'why-ai-visibility-isnt-seo',
    title: 'Why Treating ChatGPT Like Google Will Guarantee Your Failure',
    excerpt: 'The fundamental differences between AI search optimization (AEO/GEO) and traditional SEO. Why RAG, reranking, and probabilistic systems require new frameworks.',
    content: 'Look, I get it. Every time a new search technology appears, we try to map it to what we already know. When mobile search exploded, we called it "mobile SEO." When voice assistants arrived, we coined "voice search optimization" and told everyone this would be the new hype. I\'ve been doing SEO for years. I know how Google works – or at least I thought I did. Then I started digging into how ChatGPT picks citations, how Perplexity ranks sources, and how Google\'s AI Overviews select content.',
    date: '2025-01-31T00:00:00Z',
    author: 'DealershipAI',
    tags: ['AEO/GEO', 'RAG Systems', 'AI Search'],
  },
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com';
  const siteUrl = `${baseUrl}/insights`;
  const feedUrl = `${baseUrl}/insights/feed.xml`;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>DealershipAI Insights - AI Visibility Research</title>
    <link>${siteUrl}</link>
    <description>Research, analysis, and insights on AI search optimization (AEO/GEO) for automotive dealerships. Understanding how ChatGPT, Perplexity, and Google AI Overviews work differently from traditional search.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>DealershipAI Insights</title>
      <link>${siteUrl}</link>
    </image>
    <copyright>© 2025 DealershipAI. All rights reserved.</copyright>
    <managingEditor>insights@dealershipai.com (DealershipAI)</managingEditor>
    <webMaster>insights@dealershipai.com (DealershipAI)</webMaster>
    ${insights
      .map((insight) => {
        const pubDate = new Date(insight.date).toUTCString();
        const link = `${baseUrl}/insights/${insight.slug}`;
        const guid = `${baseUrl}/insights/${insight.slug}`;
        
        // Escape XML special characters
        const escapeXml = (str: string) => {
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        };

        return `    <item>
      <title>${escapeXml(insight.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${guid}</guid>
      <description>${escapeXml(insight.excerpt)}</description>
      <content:encoded><![CDATA[${insight.content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(insight.author)}</dc:creator>
      <category>${insight.tags.map(tag => escapeXml(tag)).join('</category><category>')}</category>
    </item>`;
      })
      .join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

