import axios from 'axios';

export interface UGCHealthResult {
  score: number;
  averageRating: number;
  totalReviews: number;
  recentReviews: number;
  responseRate: number;
  reviewVelocity: number; // Reviews per month
}

export async function analyzeUGCHealth(domain: string): Promise<number> {
  try {
    const result = await analyzeUGCHealthDetailed(domain);
    return result.score;
  } catch (error) {
    console.error('UGC Health analysis failed:', error);
    return 0;
  }
}

export async function analyzeUGCHealthDetailed(
  domain: string
): Promise<UGCHealthResult> {
  const businessName = extractBusinessName(domain);
  
  // Get Google reviews (primary source)
  const googleReviews = await getGoogleReviews(businessName);
  
  // Calculate metrics
  const totalReviews = googleReviews.total || 0;
  const averageRating = googleReviews.rating || 0;
  
  // Calculate recent reviews (last 90 days)
  const recentReviews = calculateRecentReviews(googleReviews.reviews || []);
  
  // Calculate review velocity (reviews per month)
  const reviewVelocity = (recentReviews / 3); // 3 months
  
  // Calculate response rate
  const responseRate = calculateResponseRate(googleReviews.reviews || []);

  // Calculate score
  let score = 0;

  // Average rating (30 points)
  score += (averageRating / 5) * 30;

  // Total reviews volume (25 points)
  if (totalReviews >= 100) score += 25;
  else if (totalReviews >= 50) score += 20;
  else if (totalReviews >= 25) score += 15;
  else if (totalReviews >= 10) score += 10;
  else score += (totalReviews / 10) * 10;

  // Review velocity (25 points)
  if (reviewVelocity >= 10) score += 25;
  else if (reviewVelocity >= 5) score += 20;
  else if (reviewVelocity >= 3) score += 15;
  else score += (reviewVelocity / 3) * 15;

  // Response rate (20 points)
  score += responseRate * 0.20;

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    averageRating,
    totalReviews,
    recentReviews,
    responseRate: Math.round(responseRate),
    reviewVelocity: Math.round(reviewVelocity * 10) / 10,
  };
}

async function getGoogleReviews(businessName: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not configured, returning mock data');
    // Return mock data for development
    return {
      total: 150,
      rating: 4.5,
      reviews: [
        { time: Date.now() / 1000 - 86400, author_url: 'https://example.com' },
        { time: Date.now() / 1000 - 172800, author_url: null },
        { time: Date.now() / 1000 - 259200, author_url: 'https://example.com' },
      ],
    };
  }

  try {
    // First, find the place
    const searchResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: businessName,
          inputtype: 'textquery',
          fields: 'place_id',
          key: apiKey,
        },
      }
    );

    const placeId = searchResponse.data.candidates[0]?.place_id;
    if (!placeId) {
      return { total: 0, rating: 0, reviews: [] };
    }

    // Get place details with reviews
    const detailsResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'rating,user_ratings_total,reviews',
          key: apiKey,
        },
      }
    );

    const result = detailsResponse.data.result;
    
    return {
      total: result.user_ratings_total || 0,
      rating: result.rating || 0,
      reviews: result.reviews || [],
    };
  } catch (error) {
    console.error('Failed to fetch Google reviews:', error);
    return { total: 0, rating: 0, reviews: [] };
  }
}

function calculateRecentReviews(reviews: any[]): number {
  const ninetyDaysAgo = Date.now() / 1000 - (90 * 24 * 60 * 60);
  return reviews.filter(review => review.time >= ninetyDaysAgo).length;
}

function calculateResponseRate(reviews: any[]): number {
  if (reviews.length === 0) return 0;
  
  const reviewsWithResponses = reviews.filter(
    review => review.author_url // This is a simplified check
  ).length;
  
  return (reviewsWithResponses / reviews.length) * 100;
}

function extractBusinessName(domain: string): string {
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
  return cleanDomain.replace(/-/g, ' ');
}
