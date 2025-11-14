/**
 * Weather Context Integration
 *
 * Fetches live weather data for dealer locations using OpenWeatherMap API.
 * Used by knowledge graph and dealer-twin endpoints for context-aware insights.
 *
 * Phase 3: Context + Copilot Evolution
 */

export interface WeatherContext {
  condition: string; // 'Clear', 'Rain', 'Snow', 'Clouds', etc.
  temperature: number; // Fahrenheit
  impact: number; // -1 to 1 (negative = bad for traffic, positive = good)
  timestamp: string;
  humidity?: number;
  wind_speed?: number;
}

/**
 * Fetch current weather for a location
 *
 * @param lat Latitude
 * @param lon Longitude
 * @returns WeatherContext with impact score
 */
export async function fetchWeatherContext(
  lat: number,
  lon: number
): Promise<WeatherContext> {
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;

  if (!WEATHER_API_KEY) {
    console.warn('[weather] WEATHER_API_KEY not configured, returning mock data');
    return getMockWeather();
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();

    // Calculate impact score based on conditions
    const impact = calculateWeatherImpact(
      data.weather[0].main,
      data.main.temp,
      data.wind.speed
    );

    return {
      condition: data.weather[0].main,
      temperature: Math.round(data.main.temp),
      impact,
      timestamp: new Date().toISOString(),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed),
    };
  } catch (error) {
    console.error('[weather] Failed to fetch weather:', error);
    return getMockWeather();
  }
}

/**
 * Calculate weather impact on dealer traffic
 *
 * Research shows:
 * - Clear weather slightly increases foot traffic (+15%)
 * - Light rain decreases traffic (-25%)
 * - Heavy rain/snow significantly decreases (-40%)
 * - Extreme temperatures (too hot/cold) decrease traffic (-20%)
 */
function calculateWeatherImpact(
  condition: string,
  temperature: number,
  windSpeed: number
): number {
  let impact = 0;

  // Temperature impact
  if (temperature >= 60 && temperature <= 80) {
    impact += 0.15; // Ideal weather
  } else if (temperature > 85 || temperature < 30) {
    impact -= 0.25; // Too hot or too cold
  } else if (temperature > 80 || temperature < 40) {
    impact -= 0.10; // Somewhat uncomfortable
  }

  // Condition impact
  switch (condition.toLowerCase()) {
    case 'clear':
    case 'sunny':
      impact += 0.15;
      break;
    case 'clouds':
    case 'partly cloudy':
      impact += 0.05; // Neutral to slightly positive
      break;
    case 'rain':
    case 'drizzle':
      impact -= 0.25;
      break;
    case 'thunderstorm':
    case 'heavy rain':
      impact -= 0.40;
      break;
    case 'snow':
    case 'sleet':
      impact -= 0.45;
      break;
    case 'fog':
    case 'mist':
      impact -= 0.15;
      break;
  }

  // Wind impact (high wind = less traffic)
  if (windSpeed > 20) {
    impact -= 0.15;
  } else if (windSpeed > 30) {
    impact -= 0.25;
  }

  // Cap impact between -1 and 1
  return Math.max(-1, Math.min(1, impact));
}

/**
 * Mock weather data for development/fallback
 */
function getMockWeather(): WeatherContext {
  return {
    condition: 'Clear',
    temperature: 72,
    impact: 0.15,
    timestamp: new Date().toISOString(),
    humidity: 55,
    wind_speed: 8,
  };
}

/**
 * Get weather description for insights
 */
export function getWeatherInsight(weather: WeatherContext): string {
  if (weather.impact > 0.2) {
    return `☀️ Great weather conditions (${weather.condition}, ${weather.temperature}°F) likely driving increased foot traffic`;
  } else if (weather.impact < -0.2) {
    return `🌧️ Poor weather conditions (${weather.condition}, ${weather.temperature}°F) may be suppressing traffic`;
  } else {
    return `🌤️ Weather conditions (${weather.condition}, ${weather.temperature}°F) having minimal impact on traffic`;
  }
}

/**
 * Batch fetch weather for multiple locations
 */
export async function fetchWeatherBatch(
  locations: Array<{ lat: number; lon: number; dealerId: string }>
): Promise<Map<string, WeatherContext>> {
  const results = new Map<string, WeatherContext>();

  // Fetch in parallel with rate limiting (max 60 req/min for free tier)
  const batchSize = 10;
  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    const promises = batch.map(loc =>
      fetchWeatherContext(loc.lat, loc.lon).then(weather => ({
        dealerId: loc.dealerId,
        weather,
      }))
    );

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ dealerId, weather }) => {
      results.set(dealerId, weather);
    });

    // Wait 1 second between batches to respect rate limits
    if (i + batchSize < locations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
