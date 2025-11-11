/**
 * Google Analytics 4 Data API Integration
 * Fetches real metrics from dealer's GA4 properties
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

interface GA4Metrics {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  topPages: Array<{ page: string; views: number }>;
  topSources: Array<{ source: string; users: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
}

/**
 * Initialize GA4 client with service account
 */
function getAnalyticsClient() {
  // Use service account credentials from environment
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : undefined;

  return new BetaAnalyticsDataClient({
    credentials,
  });
}

/**
 * Fetch GA4 metrics for a dealer
 */
export async function fetchGA4Metrics(
  propertyId: string,
  dateRange: '7d' | '30d' | '90d' = '30d'
): Promise<GA4Metrics> {
  try {
    const analyticsDataClient = getAnalyticsClient();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dateRange === '7d' ? '7daysAgo' : dateRange === '30d' ? '30daysAgo' : '90daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'pagePath' },
        { name: 'sessionDefaultChannelGrouping' },
        { name: 'deviceCategory' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
    });

    // Parse response
    const rows = response.rows || [];

    let totalSessions = 0;
    let totalUsers = 0;
    let totalNewUsers = 0;
    let totalPageviews = 0;
    let totalBounceRate = 0;
    let totalSessionDuration = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    const pageViews = new Map<string, number>();
    const sourceUsers = new Map<string, number>();
    const deviceCounts = new Map<string, number>();

    for (const row of rows) {
      const page = row.dimensionValues?.[0]?.value || '';
      const source = row.dimensionValues?.[1]?.value || '';
      const device = row.dimensionValues?.[2]?.value || '';

      const sessions = parseInt(row.metricValues?.[0]?.value || '0');
      const users = parseInt(row.metricValues?.[1]?.value || '0');
      const newUsers = parseInt(row.metricValues?.[2]?.value || '0');
      const pageviews = parseInt(row.metricValues?.[3]?.value || '0');
      const bounceRate = parseFloat(row.metricValues?.[4]?.value || '0');
      const sessionDuration = parseFloat(row.metricValues?.[5]?.value || '0');
      const conversions = parseInt(row.metricValues?.[6]?.value || '0');
      const revenue = parseFloat(row.metricValues?.[7]?.value || '0');

      totalSessions += sessions;
      totalUsers += users;
      totalNewUsers += newUsers;
      totalPageviews += pageviews;
      totalBounceRate += bounceRate;
      totalSessionDuration += sessionDuration;
      totalConversions += conversions;
      totalRevenue += revenue;

      // Aggregate by page
      pageViews.set(page, (pageViews.get(page) || 0) + pageviews);

      // Aggregate by source
      sourceUsers.set(source, (sourceUsers.get(source) || 0) + users);

      // Aggregate by device
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + sessions);
    }

    // Calculate averages and top items
    const avgBounceRate = rows.length > 0 ? totalBounceRate / rows.length : 0;
    const avgSessionDuration = rows.length > 0 ? totalSessionDuration / rows.length : 0;
    const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;

    // Top pages
    const topPages = Array.from(pageViews.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Top sources
    const topSources = Array.from(sourceUsers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, users]) => ({ source, users }));

    // Device breakdown
    const totalDeviceSessions = Array.from(deviceCounts.values()).reduce((a, b) => a + b, 0);
    const deviceBreakdown = Array.from(deviceCounts.entries())
      .map(([device, count]) => ({
        device,
        percentage: totalDeviceSessions > 0 ? (count / totalDeviceSessions) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      sessions: totalSessions,
      users: totalUsers,
      newUsers: totalNewUsers,
      pageviews: totalPageviews,
      bounceRate: avgBounceRate,
      averageSessionDuration: avgSessionDuration,
      conversions: totalConversions,
      conversionRate,
      revenue: totalRevenue,
      topPages,
      topSources,
      deviceBreakdown,
    };
  } catch (error) {
    console.error('Error fetching GA4 metrics:', error);
    throw new Error(`Failed to fetch GA4 data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test GA4 connection (for audit system)
 */
export async function testGA4Connection(propertyId: string): Promise<boolean> {
  try {
    const analyticsDataClient = getAnalyticsClient();

    // Simple metadata check
    const [response] = await analyticsDataClient.getMetadata({
      name: `properties/${propertyId}/metadata`,
    });

    return !!response;
  } catch (error) {
    console.error('GA4 connection test failed:', error);
    return false;
  }
}

/**
 * Extract property ID from measurement ID
 * Measurement ID format: G-XXXXXXXXXX
 * Property ID is numeric
 */
export function extractPropertyId(measurementId: string): string | null {
  // This requires looking up the property ID from the measurement ID
  // For now, return the measurement ID (user should provide property ID separately)
  return null;
}
