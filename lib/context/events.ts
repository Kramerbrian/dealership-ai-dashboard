/**
 * Local Events Context Integration
 *
 * Fetches local events (auto shows, festivals, sports) that may impact dealer traffic.
 * Used by knowledge graph and dealer-twin endpoints for context-aware insights.
 *
 * Phase 3: Context + Copilot Evolution - Week 2
 */

export interface LocalEvent {
  id: string;
  name: string;
  date: string; // ISO 8601
  distance: number; // miles from dealer
  category: 'auto_show' | 'festival' | 'sports' | 'concert' | 'convention' | 'other';
  impact: number; // 0-1 (predicted traffic impact)
  venue?: string;
  url?: string;
}

export interface EventsContext {
  events: LocalEvent[];
  nearest?: LocalEvent;
  count: number;
  totalImpact: number; // Combined impact score
  timestamp: string;
}

/**
 * Fetch local events near a dealer location
 *
 * @param lat Latitude
 * @param lon Longitude
 * @param radiusMiles Search radius (default: 25 miles)
 * @returns EventsContext with impact scoring
 */
export async function fetchLocalEvents(
  lat: number,
  lon: number,
  radiusMiles: number = 25
): Promise<EventsContext> {
  const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;

  if (!EVENTBRITE_API_KEY) {
    console.warn('[events] EVENTBRITE_API_KEY not configured, returning mock data');
    return getMockEvents();
  }

  try {
    // Eventbrite API v3
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${lat}&location.longitude=${lon}&location.within=${radiusMiles}mi&expand=venue&token=${EVENTBRITE_API_KEY}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`);
    }

    const data = await response.json();

    const events: LocalEvent[] = data.events
      .slice(0, 20) // Limit to 20 closest events
      .map((event: any) => {
        const category = categorizeEvent(event.name.text);
        const distance = calculateDistance(
          lat,
          lon,
          event.venue?.latitude || lat,
          event.venue?.longitude || lon
        );

        return {
          id: event.id,
          name: event.name.text,
          date: event.start.local,
          distance,
          category,
          impact: calculateEventImpact(category, distance, event.capacity),
          venue: event.venue?.name,
          url: event.url,
        };
      });

    // Sort by impact (highest first)
    events.sort((a, b) => b.impact - a.impact);

    const totalImpact = events.reduce((sum, e) => sum + e.impact, 0);

    return {
      events,
      nearest: events.length > 0 ? events[0] : undefined,
      count: events.length,
      totalImpact: Math.min(totalImpact, 1.0), // Cap at 1.0
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[events] Failed to fetch events:', error);
    return getMockEvents();
  }
}

/**
 * Categorize event based on name/description
 */
function categorizeEvent(name: string): LocalEvent['category'] {
  const lower = name.toLowerCase();

  if (
    lower.includes('auto') ||
    lower.includes('car') ||
    lower.includes('motor') ||
    lower.includes('vehicle')
  ) {
    return 'auto_show';
  }

  if (
    lower.includes('festival') ||
    lower.includes('fair') ||
    lower.includes('celebration')
  ) {
    return 'festival';
  }

  if (
    lower.includes('game') ||
    lower.includes('sports') ||
    lower.includes('football') ||
    lower.includes('basketball') ||
    lower.includes('baseball')
  ) {
    return 'sports';
  }

  if (lower.includes('concert') || lower.includes('music')) {
    return 'concert';
  }

  if (lower.includes('convention') || lower.includes('expo') || lower.includes('conference')) {
    return 'convention';
  }

  return 'other';
}

/**
 * Calculate event impact on dealer traffic
 *
 * Research shows:
 * - Auto shows: High impact (+80%) within 10 miles
 * - Large festivals: Medium-high impact (+40%) within 5 miles
 * - Sports events: Medium impact (+25%) within 3 miles
 * - Other events: Low impact (+10%)
 */
function calculateEventImpact(
  category: LocalEvent['category'],
  distance: number,
  capacity?: number
): number {
  let baseImpact = 0;

  // Base impact by category
  switch (category) {
    case 'auto_show':
      baseImpact = 0.80;
      break;
    case 'festival':
      baseImpact = 0.40;
      break;
    case 'sports':
      baseImpact = 0.25;
      break;
    case 'concert':
      baseImpact = 0.15;
      break;
    case 'convention':
      baseImpact = 0.30;
      break;
    case 'other':
      baseImpact = 0.10;
      break;
  }

  // Distance decay (closer = higher impact)
  let distanceFactor = 1.0;
  if (distance > 25) {
    distanceFactor = 0.1;
  } else if (distance > 15) {
    distanceFactor = 0.3;
  } else if (distance > 10) {
    distanceFactor = 0.5;
  } else if (distance > 5) {
    distanceFactor = 0.7;
  } else {
    distanceFactor = 1.0;
  }

  // Capacity boost (larger events = more impact)
  let capacityBoost = 1.0;
  if (capacity) {
    if (capacity > 10000) capacityBoost = 1.5;
    else if (capacity > 5000) capacityBoost = 1.3;
    else if (capacity > 1000) capacityBoost = 1.1;
  }

  return Math.min(baseImpact * distanceFactor * capacityBoost, 1.0);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Mock events data for development/fallback
 */
function getMockEvents(): EventsContext {
  return {
    events: [
      {
        id: 'mock-1',
        name: 'Local Auto Show',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        distance: 3.2,
        category: 'auto_show',
        impact: 0.75,
        venue: 'Convention Center',
      },
      {
        id: 'mock-2',
        name: 'Summer Music Festival',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        distance: 8.5,
        category: 'festival',
        impact: 0.28,
        venue: 'City Park',
      },
    ],
    nearest: {
      id: 'mock-1',
      name: 'Local Auto Show',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      distance: 3.2,
      category: 'auto_show',
      impact: 0.75,
      venue: 'Convention Center',
    },
    count: 2,
    totalImpact: 0.85,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get insight text for events context
 */
export function getEventsInsight(context: EventsContext): string {
  if (context.count === 0) {
    return '📅 No major local events detected in the next 30 days';
  }

  const nearest = context.nearest!;
  const daysUntil = Math.ceil(
    (new Date(nearest.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (nearest.category === 'auto_show' && nearest.distance < 10) {
    return `🚗 High-impact auto show "${nearest.name}" in ${daysUntil} days (${nearest.distance.toFixed(1)} miles away) - expect significant traffic increase`;
  }

  if (context.totalImpact > 0.5) {
    return `🎪 ${context.count} nearby events creating opportunity - nearest: "${nearest.name}" (${nearest.distance.toFixed(1)} miles, ${daysUntil} days)`;
  }

  if (context.count > 5) {
    return `📊 ${context.count} local events detected - moderate traffic impact expected`;
  }

  return `📅 ${context.count} local event(s) nearby - minimal traffic impact`;
}

/**
 * Batch fetch events for multiple dealer locations
 */
export async function fetchEventsBatch(
  locations: Array<{ lat: number; lon: number; dealerId: string }>
): Promise<Map<string, EventsContext>> {
  const results = new Map<string, EventsContext>();

  // Fetch in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    const promises = batch.map(loc =>
      fetchLocalEvents(loc.lat, loc.lon).then(events => ({
        dealerId: loc.dealerId,
        events,
      }))
    );

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ dealerId, events }) => {
      results.set(dealerId, events);
    });

    // Wait 1 second between batches to respect rate limits
    if (i + batchSize < locations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
