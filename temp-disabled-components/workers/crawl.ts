/**
 * DealershipAI Site Intelligence - Playwright Crawler Worker
 * 
 * Crawls dealership websites and extracts page data for analysis
 */

import { chromium, Browser, Page } from 'playwright';
import { db, pages, issues, crawlJobs } from '../src/lib/db';
import { eq, and } from 'drizzle-orm';
import { addProcessJob } from '../src/lib/queue';

interface CrawlResult {
  success: boolean;
  pageData?: any;
  issues?: any[];
  error?: string;
}

export class SiteCrawler {
  private browser: Browser | null = null;
  private tenantId: string;
  private jobId: string;

  constructor(tenantId: string, jobId: string) {
    this.tenantId = tenantId;
    this.jobId = jobId;
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async crawlPage(url: string): Promise<CrawlResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set viewport and user agent
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (compatible; DealershipAI-Crawler/1.0)'
      });

      // Navigate to page
      const startTime = Date.now();
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      const loadTime = (Date.now() - startTime) / 1000;

      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status()}: ${response?.statusText()}`);
      }

      // Extract page data
      const pageData = await this.extractPageData(page, url, loadTime);
      
      // Identify issues
      const issues = await this.identifyIssues(page, url);

      // Save page data to database
      const [savedPage] = await db.insert(pages).values({
        tenantId: this.tenantId,
        ...pageData
      }).returning();

      // Save issues to database
      if (issues.length > 0) {
        await db.insert(issues).values(
          issues.map(issue => ({
            tenantId: this.tenantId,
            pageId: savedPage.id,
            url,
            ...issue
          }))
        );
      }

      // Queue processing job
      await addProcessJob({
        tenantId: this.tenantId,
        pageId: savedPage.id,
        url,
        pageData,
        jobType: 'all'
      });

      return {
        success: true,
        pageData: savedPage,
        issues
      };

    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      await page.close();
    }
  }

  private async extractPageData(page: Page, url: string, loadTime: number): Promise<any> {
    // Extract basic page information
    const title = await page.title();
    const description = await page.getAttribute('meta[name="description"]', 'content');
    const keywords = await page.getAttribute('meta[name="keywords"]', 'content');
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');

    // Extract headings
    const h1 = await page.textContent('h1').catch(() => null);
    const h2 = await page.textContent('h2').catch(() => null);
    const h3 = await page.textContent('h3').catch(() => null);

    // Extract Open Graph data
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');

    // Extract Twitter Card data
    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
    const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content');
    const twitterDescription = await page.getAttribute('meta[name="twitter:description"]', 'content');
    const twitterImage = await page.getAttribute('meta[name="twitter:image"]', 'content');

    // Extract structured data
    const structuredData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).map(script => {
        try {
          return JSON.parse(script.textContent || '');
        } catch {
          return null;
        }
      }).filter(Boolean);
    });

    // Extract links
    const internalLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim(),
          title: link.getAttribute('title')
        }))
        .filter(link => link.href && link.href.startsWith('/'));
    });

    const externalLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim(),
          title: link.getAttribute('title')
        }))
        .filter(link => link.href && (link.href.startsWith('http') || link.href.startsWith('//')));
    });

    // Extract images
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        title: img.title,
        width: img.width,
        height: img.height
      }));
    });

    // Extract forms
    const forms = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      return forms.map(form => ({
        action: form.action,
        method: form.method,
        id: form.id,
        className: form.className,
        inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          required: input.required
        }))
      }));
    });

    // Extract buttons
    const buttons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
      return buttons.map(button => ({
        text: button.textContent?.trim(),
        type: button.type,
        id: button.id,
        className: button.className,
        disabled: button.disabled
      }));
    });

    // Extract navigation
    const navigation = await page.evaluate(() => {
      const navs = Array.from(document.querySelectorAll('nav'));
      return navs.map(nav => ({
        id: nav.id,
        className: nav.className,
        links: Array.from(nav.querySelectorAll('a')).map(link => ({
          href: link.href,
          text: link.textContent?.trim(),
          title: link.title
        }))
      }));
    });

    // Extract content
    const content = await page.textContent('body');
    const wordCount = content ? content.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    // Get page size
    const pageSize = await page.evaluate(() => {
      return new Blob([document.documentElement.outerHTML]).size;
    });

    return {
      url,
      title,
      description,
      h1,
      h2,
      h3,
      metaKeywords: keywords,
      metaDescription: description,
      canonicalUrl: canonical,
      robotsMeta: robots,
      viewportMeta: viewport,
      openGraphTitle: ogTitle,
      openGraphDescription: ogDescription,
      openGraphImage: ogImage,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      structuredData,
      internalLinks,
      externalLinks,
      images,
      forms,
      buttons,
      navigation,
      content,
      wordCount,
      readingTime,
      loadTime: loadTime.toString(),
      pageSize,
      statusCode: 200,
      lastCrawled: new Date()
    };
  }

  private async identifyIssues(page: Page, url: string): Promise<any[]> {
    const issues: any[] = [];

    // Check for missing title
    const title = await page.title();
    if (!title || title.length < 30) {
      issues.push({
        issueType: 'seo',
        severity: 'high',
        category: 'meta',
        title: 'Missing or Short Page Title',
        description: `Page title is ${title ? 'too short' : 'missing'}. Title should be 30-60 characters.`,
        recommendation: 'Add a descriptive, keyword-rich title tag.',
        impact: 'Poor SEO performance and search engine visibility.',
        effort: 'low',
        priority: 90
      });
    }

    // Check for missing meta description
    const description = await page.getAttribute('meta[name="description"]', 'content');
    if (!description || description.length < 120) {
      issues.push({
        issueType: 'seo',
        severity: 'medium',
        category: 'meta',
        title: 'Missing or Short Meta Description',
        description: `Meta description is ${description ? 'too short' : 'missing'}. Should be 120-160 characters.`,
        recommendation: 'Add a compelling meta description that includes target keywords.',
        impact: 'Reduced click-through rates from search results.',
        effort: 'low',
        priority: 70
      });
    }

    // Check for missing H1
    const h1 = await page.textContent('h1');
    if (!h1) {
      issues.push({
        issueType: 'seo',
        severity: 'high',
        category: 'content',
        title: 'Missing H1 Heading',
        description: 'Page is missing an H1 heading tag.',
        recommendation: 'Add a single H1 heading that describes the main content of the page.',
        impact: 'Poor content structure and SEO performance.',
        effort: 'low',
        priority: 85
      });
    }

    // Check for multiple H1s
    const h1Count = await page.locator('h1').count();
    if (h1Count > 1) {
      issues.push({
        issueType: 'seo',
        severity: 'medium',
        category: 'content',
        title: 'Multiple H1 Headings',
        description: `Page has ${h1Count} H1 headings. Should have only one.`,
        recommendation: 'Use only one H1 per page and use H2-H6 for subheadings.',
        impact: 'Confuses search engines about page hierarchy.',
        effort: 'medium',
        priority: 60
      });
    }

    // Check for missing alt text on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.alt || img.alt.trim() === '').length;
    });

    if (imagesWithoutAlt > 0) {
      issues.push({
        issueType: 'accessibility',
        severity: 'medium',
        category: 'content',
        title: 'Images Missing Alt Text',
        description: `${imagesWithoutAlt} images are missing alt text.`,
        recommendation: 'Add descriptive alt text to all images for accessibility.',
        impact: 'Poor accessibility and SEO performance.',
        effort: 'medium',
        priority: 65
      });
    }

    // Check for missing canonical URL
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    if (!canonical) {
      issues.push({
        issueType: 'seo',
        severity: 'medium',
        category: 'technical',
        title: 'Missing Canonical URL',
        description: 'Page is missing a canonical URL tag.',
        recommendation: 'Add a canonical URL to prevent duplicate content issues.',
        impact: 'Potential duplicate content penalties.',
        effort: 'low',
        priority: 55
      });
    }

    // Check for slow loading (simplified check)
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    if (loadTime > 3000) {
      issues.push({
        issueType: 'performance',
        severity: 'high',
        category: 'technical',
        title: 'Slow Page Load Time',
        description: `Page loads in ${loadTime}ms, which is slower than recommended.`,
        recommendation: 'Optimize images, minify CSS/JS, and improve server response time.',
        impact: 'High bounce rate and poor user experience.',
        effort: 'high',
        priority: 80
      });
    }

    return issues;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Worker function for BullMQ
export async function crawlWorker(job: any) {
  const { tenantId, url, jobType, metadata } = job.data;
  
  console.log(`Starting crawl job for ${url} (${jobType})`);
  
  const crawler = new SiteCrawler(tenantId, job.id);
  
  try {
    await crawler.initialize();
    const result = await crawler.crawlPage(url);
    
    if (result.success) {
      console.log(`Successfully crawled ${url}`);
      return result;
    } else {
      throw new Error(result.error || 'Crawl failed');
    }
  } catch (error) {
    console.error(`Crawl job failed for ${url}:`, error);
    throw error;
  } finally {
    await crawler.close();
  }
}
