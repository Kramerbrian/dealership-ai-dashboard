import axios from 'axios';

export interface GeoTrustResult {
  score: number;
  hasGMB: boolean;
  completeness: number;
  rating?: number;
  reviewCount?: number;
  hasPhotos: boolean;
  hasHours: boolean;
}

export async function analyzeGeoTrust(domain: string): Promise<number> {
  try {
    const result = await analyzeGeoTrustDetailed(domain);
    return result.score;
  } catch (error) {
    console.error('Geo Trust analysis failed:', error);
    return 0;
  }
}

export async function analyzeGeoTrustDetailed(
  domain: string
): Promise<GeoTrustResult> {
  const businessName = extractBusinessName(domain);
  
  // Search for business on Google Places
  const placeData = await searchGooglePlaces(businessName);
  
  if (!placeData) {
    return {
      score: 0,
      hasGMB: false,
      completeness: 0,
      hasPhotos: false,
      hasHours: false,
    };
  }

  // Get place details
  const details = await getPlaceDetails(placeData.place_id);
  
  // Calculate completeness
  let completeness = 0;
  const checkFields = [
    'formatted_address',
    'formatted_phone_number',
    'website',
    'opening_hours',
    'photos',
    'types',
  ];

  checkFields.forEach(field => {
    if (details[field]) completeness += (100 / checkFields.length);
  });

  // Calculate score
  let score = 0;

  // Has GMB listing (30 points)
  score += 30;

  // Completeness (40 points)
  score += (completeness / 100) * 40;

  // Reviews (20 points)
  if (details.rating) {
    score += (details.rating / 5) * 10;
  }
  if (details.user_ratings_total && details.user_ratings_total > 10) {
    score += Math.min(details.user_ratings_total / 10, 10);
  }

  // Photos (10 points)
  if (details.photos && details.photos.length > 5) {
    score += 10;
  } else if (details.photos && details.photos.length > 0) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    hasGMB: true,
    completeness: Math.round(completeness),
    rating: details.rating,
    reviewCount: details.user_ratings_total,
    hasPhotos: details.photos && details.photos.length > 0,
    hasHours: !!details.opening_hours,
  };
}

async function searchGooglePlaces(businessName: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not configured, returning mock data');
    // Return mock data for development
    return {
      place_id: 'mock_place_id',
      name: businessName,
      formatted_address: 'Mock Address',
    };
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: businessName,
          inputtype: 'textquery',
          fields: 'place_id,name,formatted_address',
          key: apiKey,
        },
      }
    );

    return response.data.candidates[0] || null;
  } catch (error) {
    console.error('Google Places search failed:', error);
    return null;
  }
}

async function getPlaceDetails(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    // Return mock data for development
    return {
      name: 'Mock Business',
      rating: 4.5,
      user_ratings_total: 150,
      formatted_address: 'Mock Address',
      formatted_phone_number: '(555) 123-4567',
      website: 'https://example.com',
      opening_hours: { open_now: true },
      photos: [{ photo_reference: 'mock_photo' }],
      types: ['car_dealer', 'establishment'],
    };
  }

  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/place/details/json',
    {
      params: {
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,opening_hours,photos,types',
        key: apiKey,
      },
    }
  );

  return response.data.result;
}

function extractBusinessName(domain: string): string {
  // Simple extraction - can be improved
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
  return cleanDomain.replace(/-/g, ' ');
}
