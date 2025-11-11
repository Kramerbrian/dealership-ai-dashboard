/**
 * Auto-Discovery Service
 *
 * Automatically discovers dealer information from their website URL:
 * - Google Business Profile link
 * - Nearby competitors
 * - Review platforms
 * - Social media presence
 * - Contact information
 */

import { z } from 'zod';

// Discovery result schemas
export const DiscoveryResultSchema = z.object({
  gbp: z.object({
    url: z.string().optional(),
    placeId: z.string().optional(),
    confidence: z.number().min(0).max(1),
    verified: z.boolean(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    distance: z.number(), // in miles
    placeId: z.string().optional(),
    confidence: z.number().min(0).max(1),
    address: z.string().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
  })),
  reviewPlatforms: z.array(z.object({
    platform: z.enum(['google', 'yelp', 'dealerrater', 'cars_com', 'edmunds', 'facebook']),
    url: z.string(),
    profileId: z.string().optional(),
    reviewCount: z.number().optional(),
    averageRating: z.number().optional(),
    confidence: z.number().min(0).max(1),
  })),
  dealerInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    makes: z.array(z.string()),
    dealerType: z.enum(['new', 'used', 'both']),
  }),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
  }),
  suggestedAdditions: z.array(z.string()),
  scanDuration: z.number(), // milliseconds
});

export type DiscoveryResult = z.infer<typeof DiscoveryResultSchema>;

interface WebsiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  structuredData: any[];
  links: string[];
  metaTags: Record<string, string>;
}

/**
 * Extract metadata from dealer website
 */
async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DealershipAI/1.0; +https://dealershipai.com)',
      },
      signal: AbortSignal.timeout(10000),
    });

    const html = await response.text();

    // Parse HTML (simplified - in production use cheerio or similar)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

    // Extract structured data (JSON-LD)
    const jsonLdMatches = html.matchAll(/<script\s+type=["']application\/ld\+json["']>(.*?)<\/script>/gis);
    const structuredData = [];
    for (const match of jsonLdMatches) {
      try {
        structuredData.push(JSON.parse(match[1]));
      } catch (e) {
        // Skip invalid JSON-LD
      }
    }

    // Extract all links
    const linkMatches = html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi);
    const links = Array.from(linkMatches).map(m => m[1]);

    return {
      title: titleMatch?.[1] || '',
      description: descMatch?.[1] || '',
      keywords: [],
      structuredData,
      links,
      metaTags: {},
    };
  } catch (error) {
    console.error('Error fetching website metadata:', error);
    throw new Error('Failed to access dealer website');
  }
}

/**
 * Find Google Business Profile link from website
 */
function findGBPLink(metadata: WebsiteMetadata): { url?: string; confidence: number } {
  const { links, structuredData } = metadata;

  // Check structured data for LocalBusiness
  const localBusiness = structuredData.find(
    (data: any) => data['@type'] === 'LocalBusiness' || data['@type'] === 'AutoDealer'
  );

  if (localBusiness?.hasMap || localBusiness?.url?.includes('google.com/maps')) {
    return {
      url: localBusiness.hasMap || localBusiness.url,
      confidence: 0.95,
    };
  }

  // Search for Google Maps links
  const gbpLink = links.find(link =>
    link.includes('google.com/maps') ||
    link.includes('goo.gl/maps') ||
    link.includes('maps.app.goo.gl')
  );

  if (gbpLink) {
    return { url: gbpLink, confidence: 0.85 };
  }

  return { confidence: 0 };
}

/**
 * Extract dealer information from website metadata
 */
function extractDealerInfo(metadata: WebsiteMetadata, url: string): DiscoveryResult['dealerInfo'] {
  const { title, structuredData } = metadata;

  // Try to get info from structured data
  const localBusiness = structuredData.find(
    (data: any) => data['@type'] === 'LocalBusiness' || data['@type'] === 'AutoDealer'
  );

  const name = localBusiness?.name || title.split('-')[0].trim() || 'Unknown Dealership';

  // Detect car makes from title/content
  const commonMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes',
    'Audi', 'Lexus', 'Mazda', 'Subaru', 'Hyundai', 'Kia', 'Volkswagen'
  ];

  const detectedMakes = commonMakes.filter(make =>
    title.toLowerCase().includes(make.toLowerCase()) ||
    url.toLowerCase().includes(make.toLowerCase())
  );

  return {
    name,
    address: localBusiness?.address?.streetAddress,
    city: localBusiness?.address?.addressLocality,
    state: localBusiness?.address?.addressRegion,
    zip: localBusiness?.address?.postalCode,
    phone: localBusiness?.telephone,
    makes: detectedMakes.length > 0 ? detectedMakes : ['Unknown'],
    dealerType: 'both', // Default, can be refined
  };
}

/**
 * Find review platform profiles
 */
function findReviewPlatforms(metadata: WebsiteMetadata, dealerInfo: DiscoveryResult['dealerInfo']): DiscoveryResult['reviewPlatforms'] {
  const { links } = metadata;
  const platforms: DiscoveryResult['reviewPlatforms'] = [];

  // Yelp
  const yelpLink = links.find(link => link.includes('yelp.com'));
  if (yelpLink) {
    platforms.push({
      platform: 'yelp',
      url: yelpLink,
      confidence: 0.9,
    });
  }

  // DealerRater
  const dealerRaterLink = links.find(link => link.includes('dealerrater.com'));
  if (dealerRaterLink) {
    platforms.push({
      platform: 'dealerrater',
      url: dealerRaterLink,
      confidence: 0.9,
    });
  }

  // Cars.com
  const carsLink = links.find(link => link.includes('cars.com/dealers'));
  if (carsLink) {
    platforms.push({
      platform: 'cars_com',
      url: carsLink,
      confidence: 0.85,
    });
  }

  // Facebook
  const facebookLink = links.find(link => link.includes('facebook.com'));
  if (facebookLink) {
    platforms.push({
      platform: 'facebook',
      url: facebookLink,
      confidence: 0.8,
    });
  }

  return platforms;
}

/**
 * Find social media profiles
 */
function findSocialMedia(metadata: WebsiteMetadata): DiscoveryResult['socialMedia'] {
  const { links } = metadata;

  return {
    facebook: links.find(l => l.includes('facebook.com')),
    twitter: links.find(l => l.includes('twitter.com') || l.includes('x.com')),
    instagram: links.find(l => l.includes('instagram.com')),
    youtube: links.find(l => l.includes('youtube.com')),
  };
}

/**
 * Main auto-discovery function
 *
 * @param dealerUrl - The dealer's website URL
 * @returns Complete discovery results with confidence scores
 */
export async function autoDiscoverDealer(dealerUrl: string): Promise<DiscoveryResult> {
  const startTime = Date.now();

  // Normalize URL
  const url = dealerUrl.startsWith('http') ? dealerUrl : `https://${dealerUrl}`;

  try {
    // Step 1: Fetch website metadata
    const metadata = await fetchWebsiteMetadata(url);

    // Step 2: Extract dealer information
    const dealerInfo = extractDealerInfo(metadata, url);

    // Step 3: Find Google Business Profile
    const gbpResult = findGBPLink(metadata);

    // Step 4: Find review platforms
    const reviewPlatforms = findReviewPlatforms(metadata, dealerInfo);

    // Step 5: Find social media
    const socialMedia = findSocialMedia(metadata);

    // Step 6: Mock competitor discovery (in production, use Google Places API)
    const competitors: DiscoveryResult['competitors'] = [];

    // Step 7: Generate suggestions
    const suggestedAdditions: string[] = [];
    if (!gbpResult.url) {
      suggestedAdditions.push('Create or claim your Google Business Profile');
    }
    if (reviewPlatforms.length < 3) {
      suggestedAdditions.push('Add profiles on DealerRater and Cars.com for more visibility');
    }
    if (!socialMedia.facebook && !socialMedia.instagram) {
      suggestedAdditions.push('Set up social media presence on Facebook and Instagram');
    }

    const result: DiscoveryResult = {
      gbp: {
        url: gbpResult.url,
        confidence: gbpResult.confidence,
        verified: gbpResult.confidence > 0.8,
        name: dealerInfo.name,
      },
      competitors,
      reviewPlatforms,
      dealerInfo,
      socialMedia,
      suggestedAdditions,
      scanDuration: Date.now() - startTime,
    };

    return DiscoveryResultSchema.parse(result);

  } catch (error: any) {
    throw new Error(`Auto-discovery failed: ${error.message}`);
  }
}

/**
 * Mock discovery for demo purposes
 * Returns realistic demo data instantly
 */
export function mockAutoDiscoverDealer(dealerUrl: string): DiscoveryResult {
  const dealerName = dealerUrl.split('.')[0].replace('www.', '').replace(/-/g, ' ');

  return {
    gbp: {
      url: 'https://maps.google.com/?cid=12345678901234567890',
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      confidence: 0.95,
      verified: true,
      name: `${dealerName.charAt(0).toUpperCase() + dealerName.slice(1)} Motors`,
      address: '123 Auto Plaza Dr',
      phone: '(555) 123-4567',
    },
    competitors: [
      {
        name: 'Premium Auto Group',
        distance: 2.3,
        placeId: 'ChIJ2abc123xyz',
        confidence: 0.9,
        address: '456 Commerce Blvd',
        rating: 4.2,
        reviewCount: 234,
      },
      {
        name: 'Elite Motors',
        distance: 3.7,
        placeId: 'ChIJ3def456uvw',
        confidence: 0.85,
        address: '789 Highway 101',
        rating: 4.5,
        reviewCount: 189,
      },
      {
        name: 'AutoNation Dealership',
        distance: 4.1,
        confidence: 0.8,
        address: '321 Main Street',
        rating: 4.0,
        reviewCount: 456,
      },
    ],
    reviewPlatforms: [
      {
        platform: 'google',
        url: 'https://www.google.com/maps/place/dealer',
        reviewCount: 342,
        averageRating: 4.3,
        confidence: 0.95,
      },
      {
        platform: 'yelp',
        url: 'https://www.yelp.com/biz/dealer',
        profileId: 'dealer-123',
        reviewCount: 156,
        averageRating: 4.1,
        confidence: 0.9,
      },
      {
        platform: 'dealerrater',
        url: 'https://www.dealerrater.com/dealer/dealer-123',
        reviewCount: 89,
        averageRating: 4.4,
        confidence: 0.85,
      },
    ],
    dealerInfo: {
      name: `${dealerName.charAt(0).toUpperCase() + dealerName.slice(1)} Motors`,
      address: '123 Auto Plaza Dr',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      phone: '(555) 123-4567',
      makes: ['Toyota', 'Honda', 'Ford'],
      dealerType: 'both',
    },
    socialMedia: {
      facebook: 'https://facebook.com/dealer',
      instagram: 'https://instagram.com/dealer',
      twitter: 'https://twitter.com/dealer',
    },
    suggestedAdditions: [
      'Add Cars.com profile for increased visibility',
      'Set up YouTube channel for video marketing',
      'Claim Edmunds dealer profile',
    ],
    scanDuration: 2340,
  };
}
