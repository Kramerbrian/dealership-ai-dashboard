/**
 * Google Places API / Google Business Profile Integration
 * Fetches real business data and reviews
 */

interface PlaceDetails {
  name: string;
  rating: number;
  totalReviews: number;
  address: string;
  phone: string;
  website: string;
  businessStatus: string;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
  photos: string[];
}

interface Review {
  author: string;
  rating: number;
  text: string;
  time: number;
  relativeTime: string;
}

interface GBPMetrics {
  placeDetails: PlaceDetails;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: Review[];
  responseRate: number;
}

/**
 * Fetch Google Business Profile data
 */
export async function fetchGBPData(placeId: string): Promise<GBPMetrics> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    // Fetch place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,business_status,opening_hours,photos,reviews&key=${apiKey}`;

    const response = await fetch(detailsUrl);

    if (!response.ok) {
      throw new Error(`Places API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Places API error: ${data.status}`);
    }

    const result = data.result;

    // Parse place details
    const placeDetails: PlaceDetails = {
      name: result.name || '',
      rating: result.rating || 0,
      totalReviews: result.user_ratings_total || 0,
      address: result.formatted_address || '',
      phone: result.formatted_phone_number || '',
      website: result.website || '',
      businessStatus: result.business_status || 'UNKNOWN',
      openingHours: result.opening_hours
        ? {
            openNow: result.opening_hours.open_now || false,
            weekdayText: result.opening_hours.weekday_text || [],
          }
        : undefined,
      photos: (result.photos || []).slice(0, 5).map((photo: any) => {
        const photoRef = photo.photo_reference;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
      }),
    };

    // Parse reviews
    const reviews: Review[] = (result.reviews || []).map((review: any) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.time,
      relativeTime: review.relative_time_description,
    }));

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      }
    });

    // Calculate response rate (mock for now - requires My Business API)
    const responseRate = 0; // Would need My Business API to get actual response data

    // Get recent reviews (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentReviews = reviews.filter((review) => review.time * 1000 > thirtyDaysAgo);

    return {
      placeDetails,
      reviews: reviews.slice(0, 50), // Return up to 50 reviews
      averageRating: result.rating || 0,
      totalReviews: result.user_ratings_total || 0,
      ratingDistribution,
      recentReviews,
      responseRate,
    };
  } catch (error) {
    console.error('Error fetching GBP data:', error);
    throw new Error(`Failed to fetch Google Business Profile data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test Google Places connection (for audit system)
 */
export async function testGBPConnection(placeId: string): Promise<boolean> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return false;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.status === 'OK';
  } catch (error) {
    console.error('GBP connection test failed:', error);
    return false;
  }
}

/**
 * Fetch review insights
 */
export async function getReviewInsights(reviews: Review[]) {
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      sentimentScore: 0,
      commonThemes: [],
      needsAttention: [],
    };
  }

  // Calculate average
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  // Sentiment score (simple version)
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const sentimentScore = (positiveReviews / totalReviews) * 100;

  // Find reviews that need attention (low rating, no response)
  const needsAttention = reviews
    .filter((r) => r.rating <= 3)
    .slice(0, 5)
    .map((r) => ({
      author: r.author,
      rating: r.rating,
      text: r.text.substring(0, 100) + '...',
      time: r.relativeTime,
    }));

  return {
    averageRating: avgRating,
    sentimentScore,
    commonThemes: [], // Would use NLP to extract
    needsAttention,
  };
}
