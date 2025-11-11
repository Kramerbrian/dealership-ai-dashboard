/**
 * Production Scraper for Google Ads Compliance
 *
 * Extracts pricing data from:
 * - Google Ads (via URL or ad copy input)
 * - Landing Pages (via Puppeteer)
 * - VDP (Vehicle Detail Pages) (via Puppeteer)
 *
 * Uses Puppeteer for robust JavaScript rendering and data extraction
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import type { AdData, LandingPageData, VDPData } from './google-pricing-policy';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SCRAPER_CONFIG = {
  headless: true,
  timeout: 30000, // 30 seconds
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1920, height: 1080 },
};

// ============================================================================
// BROWSER POOL
// ============================================================================

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: SCRAPER_CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// ============================================================================
// AD SCRAPING (Manual Input or Google Ads API)
// ============================================================================

/**
 * Extract ad data from URL or manual input
 * For production, integrate with Google Ads API
 */
export async function scrapeAdData(adUrl: string): Promise<AdData> {
  // For now, expect ad data to be passed manually or via Google Ads API
  // Google Ads doesn't expose live ad preview URLs, so we'll extract from API
  console.log('[Scraper] Ad URL:', adUrl);

  // Mock implementation - replace with Google Ads API
  // Example: const adData = await googleAdsAPI.getAdCopy(adId);
  return {
    headline: 'Placeholder Ad Headline',
    description: 'Placeholder ad description',
    url: adUrl,
    disclosures: [],
    fees: [],
  };
}

// ============================================================================
// LANDING PAGE SCRAPING
// ============================================================================

/**
 * Scrape landing page for pricing offers and disclosures
 */
export async function scrapeLandingPage(url: string): Promise<LandingPageData> {
  console.log('[Scraper] Landing Page:', url);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(SCRAPER_CONFIG.userAgent);
    await page.setViewport(SCRAPER_CONFIG.viewport);

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: SCRAPER_CONFIG.timeout,
    });

    // Extract pricing data
    const data = await page.evaluate(() => {
      // Helper: Extract numbers from text
      const extractNumber = (text: string): number | undefined => {
        const match = text.match(/\$?[\d,]+(?:\.\d{2})?/);
        return match ? parseFloat(match[0].replace(/[$,]/g, '')) : undefined;
      };

      // Helper: Extract APR
      const extractAPR = (text: string): number | undefined => {
        const match = text.match(/([\d.]+)%?\s*APR/i);
        return match ? parseFloat(match[1]) : undefined;
      };

      // Helper: Extract term (months)
      const extractTerm = (text: string): number | undefined => {
        const match = text.match(/(\d+)[\s-]*(mo|month|months)/i);
        return match ? parseInt(match[1]) : undefined;
      };

      // Extract offer text (look for common pricing sections)
      const offerSelectors = [
        '[class*="offer"]',
        '[class*="special"]',
        '[class*="promotion"]',
        '[class*="deal"]',
        '[id*="offer"]',
        'h1, h2, h3', // Fallback to headings
      ];

      let offerText = '';
      for (const selector of offerSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent) {
          offerText = el.textContent.trim();
          break;
        }
      }

      // Extract CTA text
      const ctaSelectors = [
        'button[type="submit"]',
        'a[class*="cta"]',
        'a[class*="button"]',
        'input[type="submit"]',
      ];

      let ctaText = '';
      for (const selector of ctaSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent) {
          ctaText = el.textContent.trim();
          break;
        }
      }

      // Extract all text for comprehensive parsing
      const bodyText = document.body.innerText.toLowerCase();

      // Extract pricing info
      const monthlyPayment = extractNumber(bodyText.match(/\$?([\d,]+)\/mo/i)?.[0] || '');
      const price = extractNumber(bodyText.match(/price:?\s*\$?([\d,]+)/i)?.[0] || '');
      const msrp = extractNumber(bodyText.match(/msrp:?\s*\$?([\d,]+)/i)?.[0] || '');
      const apr = extractAPR(bodyText);
      const term = extractTerm(bodyText);

      // Extract down payment
      const downMatch = bodyText.match(/\$?([\d,]+)\s*down/i);
      const downPayment = downMatch ? extractNumber(downMatch[0]) : undefined;

      // Extract disclosures (look for fine print)
      const disclosureSelectors = [
        '[class*="disclosure"]',
        '[class*="disclaimer"]',
        '[class*="fine-print"]',
        'small',
        '.text-xs',
      ];

      const disclosures: string[] = [];
      disclosureSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 10) {
            disclosures.push(text);
          }
        });
      });

      // Extract fees
      const fees: { name: string; amount: number }[] = [];
      const feePattern = /(doc|documentation|dealer prep|acquisition|disposition|processing)\s*fee:?\s*\$?([\d,]+)/gi;
      let feeMatch;
      while ((feeMatch = feePattern.exec(bodyText)) !== null) {
        fees.push({
          name: feeMatch[1],
          amount: parseFloat(feeMatch[2].replace(/,/g, '')),
        });
      }

      return {
        offerText,
        ctaText,
        monthlyPayment,
        price,
        msrp,
        apr,
        term,
        downPayment,
        disclosures,
        fees,
      };
    });

    await page.close();

    return {
      url,
      offerText: data.offerText || 'No offer text found',
      ctaText: data.ctaText || 'No CTA found',
      monthlyPayment: data.monthlyPayment,
      price: data.price,
      msrp: data.msrp,
      apr: data.apr,
      term: data.term,
      downPayment: data.downPayment,
      disclosures: data.disclosures,
      fees: data.fees,
    };

  } catch (error) {
    await page.close();
    console.error('[Scraper] Landing page error:', error);
    throw new Error(`Failed to scrape landing page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// VDP SCRAPING
// ============================================================================

/**
 * Scrape Vehicle Detail Page for pricing and vehicle info
 */
export async function scrapeVDP(url: string): Promise<VDPData> {
  console.log('[Scraper] VDP:', url);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(SCRAPER_CONFIG.userAgent);
    await page.setViewport(SCRAPER_CONFIG.viewport);

    // Navigate to VDP
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: SCRAPER_CONFIG.timeout,
    });

    // Extract VDP data
    const data = await page.evaluate(() => {
      const extractNumber = (text: string): number | undefined => {
        const match = text.match(/\$?[\d,]+(?:\.\d{2})?/);
        return match ? parseFloat(match[0].replace(/[$,]/g, '')) : undefined;
      };

      const bodyText = document.body.innerText.toLowerCase();

      // Extract VIN
      const vinMatch = bodyText.match(/vin:?\s*([A-HJ-NPR-Z0-9]{17})/i);
      const vin = vinMatch?.[1] || 'UNKNOWN';

      // Extract Year/Make/Model
      const yearMatch = bodyText.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

      // Common makes
      const makes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Lexus'];
      let make = 'Unknown';
      for (const m of makes) {
        if (bodyText.includes(m.toLowerCase())) {
          make = m;
          break;
        }
      }

      // Extract model (look for text after make)
      const makeIndex = bodyText.indexOf(make.toLowerCase());
      const modelMatch = bodyText.substring(makeIndex, makeIndex + 100).match(/\w+/g);
      const model = modelMatch?.[1] || 'Unknown';

      // Extract pricing
      const priceMatch = bodyText.match(/(?:price|asking|our price):?\s*\$?([\d,]+)/i);
      const price = priceMatch ? extractNumber(priceMatch[0]) : undefined;

      const msrpMatch = bodyText.match(/msrp:?\s*\$?([\d,]+)/i);
      const msrp = msrpMatch ? extractNumber(msrpMatch[0]) : undefined;

      const monthlyMatch = bodyText.match(/\$?([\d,]+)\/mo/i);
      const monthlyPayment = monthlyMatch ? extractNumber(monthlyMatch[0]) : undefined;

      // Extract disclosures
      const disclosures: string[] = [];
      document.querySelectorAll('[class*="disclosure"], [class*="disclaimer"], small').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 10) {
          disclosures.push(text);
        }
      });

      // Extract fees
      const fees: { name: string; amount: number }[] = [];
      const feePattern = /(doc|documentation|dealer prep|acquisition|disposition|processing)\s*fee:?\s*\$?([\d,]+)/gi;
      let feeMatch;
      while ((feeMatch = feePattern.exec(bodyText)) !== null) {
        fees.push({
          name: feeMatch[1],
          amount: parseFloat(feeMatch[2].replace(/,/g, '')),
        });
      }

      return {
        vin,
        year,
        make,
        model,
        price,
        msrp,
        monthlyPayment,
        disclosures,
        fees,
      };
    });

    await page.close();

    return {
      url,
      vin: data.vin,
      year: data.year,
      make: data.make,
      model: data.model,
      price: data.price,
      msrp: data.msrp,
      monthlyPayment: data.monthlyPayment,
      disclosures: data.disclosures,
      fees: data.fees,
    };

  } catch (error) {
    await page.close();
    console.error('[Scraper] VDP error:', error);
    throw new Error(`Failed to scrape VDP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// BATCH SCRAPING
// ============================================================================

export interface ScraperInput {
  adUrl: string;
  lpUrl: string;
  vdpUrl: string;
}

export interface ScraperResult {
  ad: AdData;
  lp: LandingPageData;
  vdp: VDPData;
}

/**
 * Scrape all three sources in parallel
 */
export async function scrapeAll(input: ScraperInput): Promise<ScraperResult> {
  const startTime = Date.now();
  console.log('[Scraper] Starting batch scrape...');

  try {
    const [ad, lp, vdp] = await Promise.all([
      scrapeAdData(input.adUrl),
      scrapeLandingPage(input.lpUrl),
      scrapeVDP(input.vdpUrl),
    ]);

    const duration = Date.now() - startTime;
    console.log(`[Scraper] Batch scrape completed in ${duration}ms`);

    return { ad, lp, vdp };

  } catch (error) {
    console.error('[Scraper] Batch scrape failed:', error);
    throw error;
  }
}

/**
 * Scrape multiple ad sets in parallel (with concurrency limit)
 */
export async function scrapeMultiple(
  inputs: ScraperInput[],
  concurrency = 3
): Promise<ScraperResult[]> {
  const results: ScraperResult[] = [];
  const chunks: ScraperInput[][] = [];

  // Split into chunks for concurrency control
  for (let i = 0; i < inputs.length; i += concurrency) {
    chunks.push(inputs.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(input => scrapeAll(input))
    );
    results.push(...chunkResults);
  }

  return results;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Close browser and cleanup resources
 * Call this when shutting down your application
 */
export async function cleanup() {
  await closeBrowser();
  console.log('[Scraper] Cleanup complete');
}

// Graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
