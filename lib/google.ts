/**
 * Google Places API integration
 * Finds nearby dealership competitors
 */

type NearbyPlace = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
};

/**
 * Find nearby car dealerships using Google Places API
 */
export async function findNearbyDealers(
  lat: number,
  lng: number,
  radiusMeters = 40000
): Promise<NearbyPlace[]> {
  const key = process.env.GOOGLE_PLACES_KEY;
  
  if (!key) {
    console.warn('[Google Places] API key not configured, returning empty results');
    return [];
  }

  const type = 'car_dealer';
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${type}&key=${key}`;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Google Places API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`);
    }
    
    return (data.results as NearbyPlace[]) || [];
  } catch (error) {
    console.error('[Google Places] Error fetching nearby dealers:', error);
    return [];
  }
}

