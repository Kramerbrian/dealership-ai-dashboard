/**
 * Geocoding Service
 * Uses Mapbox Geocoding API to convert addresses to coordinates
 * Fallback to mock data if no valid location found
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  confidence: number;
}

/**
 * Geocode an address using Mapbox Geocoding API
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

  if (!mapboxToken) {
    console.warn('NEXT_PUBLIC_MAPBOX_KEY not set, skipping geocoding');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&types=address,place`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [lng, lat] = feature.center;

    // Extract city and state from context
    let city = '';
    let state = '';
    let country = '';

    for (const ctx of feature.context || []) {
      if (ctx.id.startsWith('place.')) {
        city = ctx.text;
      }
      if (ctx.id.startsWith('region.')) {
        state = ctx.short_code?.replace(/^US-/, '') || ctx.text;
      }
      if (ctx.id.startsWith('country.')) {
        country = ctx.short_code || ctx.text;
      }
    }

    return {
      lat,
      lng,
      city: city || feature.place_name.split(',')[0],
      state: state || 'Unknown',
      country: country || 'US',
      confidence: feature.relevance || 0.5,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode from city and state
 */
export async function geocodeCityState(
  city: string,
  state: string
): Promise<GeocodingResult | null> {
  const query = `${city}, ${state}`;
  return geocodeAddress(query);
}

/**
 * Get default/fallback location for demos
 */
export function getDefaultLocation(): GeocodingResult {
  return {
    lat: 40.7128,
    lng: -74.006,
    city: 'New York',
    state: 'NY',
    country: 'US',
    confidence: 0,
  };
}
