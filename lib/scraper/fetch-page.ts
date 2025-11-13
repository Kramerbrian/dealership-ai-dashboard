/**
 * Web Scraper Service
 * Fetches and parses HTML from dealership domains
 */

import * as cheerio from 'cheerio';

export interface ScrapedPage {
  html: string;
  $: cheerio.CheerioAPI;
  url: string;
  statusCode: number;
}

export interface ScrapeError {
  error: string;
  domain: string;
  statusCode?: number;
}

/**
 * Fetch and parse a webpage
 * Returns Cheerio instance for DOM parsing
 */
export async function fetchPage(domain: string): Promise<ScrapedPage | ScrapeError> {
  try {
    // Normalize domain to URL
    let url = domain.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DealershipAI/1.0; +https://dealershipai.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
        domain,
        statusCode: response.status,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      html,
      $,
      url: response.url, // Final URL after redirects
      statusCode: response.status,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        error: 'Request timeout after 10 seconds',
        domain,
      };
    }
    return {
      error: error.message || 'Failed to fetch page',
      domain,
    };
  }
}

/**
 * Extract JSON-LD structured data from page
 */
export function extractJsonLd($: cheerio.CheerioAPI): any[] {
  const jsonLdScripts: any[] = [];

  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        const parsed = JSON.parse(content);
        jsonLdScripts.push(parsed);
      }
    } catch (e) {
      // Skip invalid JSON-LD
    }
  });

  return jsonLdScripts;
}

/**
 * Extract NAP (Name, Address, Phone) from page
 */
export function extractNAP($: cheerio.CheerioAPI): {
  name: string | null;
  address: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
} {
  const text = $.text();

  // Extract phone number (US format)
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);

  // Extract from meta tags
  const name = $('meta[property="og:site_name"]').attr('content') ||
               $('meta[name="author"]').attr('content') ||
               $('title').text().split('|')[0].trim();

  return {
    name: name || null,
    address: null, // Complex parsing needed
    phone: phoneMatch ? phoneMatch[0] : null,
    city: null,
    state: null,
  };
}
