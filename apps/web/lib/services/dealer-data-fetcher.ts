/**
 * Unified Dealer Data Fetcher
 * Fetches real data from all configured integrations
 */

import { fetchGA4Metrics } from './google-analytics-data';
import { fetchGBPData } from './google-places-data';
import type { DealerSettings } from '../types/dealer-settings';

export interface DealerDashboardData {
  dealerId: string;
  dataSource: 'live' | 'demo';
  lastUpdated: string;

  // Analytics data
  analytics?: {
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
  };

  // Google Business Profile data
  googleBusiness?: {
    name: string;
    rating: number;
    totalReviews: number;
    address: string;
    phone: string;
    website: string;
    businessStatus: string;
    recentReviews: Array<{
      author: string;
      rating: number;
      text: string;
      time: number;
      relativeTime: string;
    }>;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };

  // Overall metrics
  aiVisibilityScore: number;
  competitivePosition: 'leading' | 'competitive' | 'lagging';
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
  }>;
}

/**
 * Fetch all dealer data from configured integrations
 */
export async function fetchDealerData(
  dealerId: string,
  settings: DealerSettings
): Promise<DealerDashboardData> {
  const dashboardData: DealerDashboardData = {
    dealerId,
    dataSource: 'demo',
    lastUpdated: new Date().toISOString(),
    aiVisibilityScore: 0,
    competitivePosition: 'competitive',
    recommendations: [],
  };

  const fetchPromises: Promise<void>[] = [];

  // Fetch Google Analytics data
  if (settings.analytics?.googleAnalytics?.enabled && settings.analytics.googleAnalytics.propertyId) {
    fetchPromises.push(
      fetchGA4Metrics(settings.analytics.googleAnalytics.propertyId)
        .then((gaData) => {
          dashboardData.analytics = gaData;
          dashboardData.dataSource = 'live';
        })
        .catch((error) => {
          console.error('Failed to fetch GA4 data:', error);
          // Use demo data as fallback
          dashboardData.analytics = getDemoAnalyticsData();
        })
    );
  } else {
    // Use demo data if not configured
    dashboardData.analytics = getDemoAnalyticsData();
  }

  // Fetch Google Business Profile data
  if (settings.googleBusinessProfile?.enabled && settings.googleBusinessProfile.placeId) {
    fetchPromises.push(
      fetchGBPData(settings.googleBusinessProfile.placeId)
        .then((gbpData) => {
          dashboardData.googleBusiness = {
            name: gbpData.placeDetails.name,
            rating: gbpData.averageRating,
            totalReviews: gbpData.totalReviews,
            address: gbpData.placeDetails.address,
            phone: gbpData.placeDetails.phone,
            website: gbpData.placeDetails.website,
            businessStatus: gbpData.placeDetails.businessStatus,
            recentReviews: gbpData.recentReviews,
            ratingDistribution: gbpData.ratingDistribution,
          };
          dashboardData.dataSource = 'live';
        })
        .catch((error) => {
          console.error('Failed to fetch GBP data:', error);
          // Use demo data as fallback
          dashboardData.googleBusiness = getDemoGBPData();
        })
    );
  } else {
    // Use demo data if not configured
    dashboardData.googleBusiness = getDemoGBPData();
  }

  // Wait for all fetches to complete
  await Promise.all(fetchPromises);

  // Calculate AI Visibility Score based on real data
  dashboardData.aiVisibilityScore = calculateAIVisibilityScore(dashboardData);

  // Generate recommendations based on real metrics
  dashboardData.recommendations = generateRecommendations(dashboardData);

  // Determine competitive position
  dashboardData.competitivePosition = determineCompetitivePosition(dashboardData);

  return dashboardData;
}

/**
 * Calculate AI Visibility Score from real metrics
 */
function calculateAIVisibilityScore(data: DealerDashboardData): number {
  let score = 0;
  let factors = 0;

  // Reviews score (0-30 points)
  if (data.googleBusiness) {
    const reviewScore = Math.min((data.googleBusiness.totalReviews / 100) * 10, 10); // Up to 10 points
    const ratingScore = (data.googleBusiness.rating / 5) * 20; // Up to 20 points
    score += reviewScore + ratingScore;
    factors += 30;
  }

  // Traffic score (0-30 points)
  if (data.analytics) {
    const trafficScore = Math.min((data.analytics.sessions / 10000) * 20, 20); // Up to 20 points
    const conversionScore = Math.min(data.analytics.conversionRate * 2, 10); // Up to 10 points
    score += trafficScore + conversionScore;
    factors += 30;
  }

  // Engagement score (0-20 points)
  if (data.analytics) {
    const bounceScore = (1 - data.analytics.bounceRate / 100) * 10; // Lower bounce = higher score
    const durationScore = Math.min((data.analytics.averageSessionDuration / 300) * 10, 10); // Up to 10 points
    score += bounceScore + durationScore;
    factors += 20;
  }

  // Online presence score (0-20 points)
  if (data.googleBusiness) {
    const presenceScore = data.googleBusiness.businessStatus === 'OPERATIONAL' ? 20 : 10;
    score += presenceScore;
    factors += 20;
  }

  // Normalize to 0-100
  return factors > 0 ? Math.round((score / factors) * 100) : 0;
}

/**
 * Generate recommendations based on real metrics
 */
function generateRecommendations(data: DealerDashboardData): Array<{
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}> {
  const recommendations = [];

  // Check bounce rate
  if (data.analytics && data.analytics.bounceRate > 60) {
    recommendations.push({
      priority: 'high' as const,
      title: 'High Bounce Rate Detected',
      description: `Your bounce rate is ${data.analytics.bounceRate.toFixed(1)}%, which means visitors are leaving quickly. This hurts your AI visibility score.`,
      impact: 'Reducing bounce rate by 10% could increase traffic by 15%',
    });
  }

  // Check review count
  if (data.googleBusiness && data.googleBusiness.totalReviews < 50) {
    recommendations.push({
      priority: 'high' as const,
      title: 'Need More Reviews',
      description: `You have ${data.googleBusiness.totalReviews} reviews. AI models heavily weight businesses with 50+ reviews.`,
      impact: 'Getting to 50 reviews could boost local search visibility by 25%',
    });
  }

  // Check rating
  if (data.googleBusiness && data.googleBusiness.rating < 4.5) {
    recommendations.push({
      priority: 'medium' as const,
      title: 'Improve Customer Satisfaction',
      description: `Your ${data.googleBusiness.rating.toFixed(1)}-star rating is below the optimal 4.5+ for AI recommendations.`,
      impact: 'Improving to 4.5+ stars could double AI referrals',
    });
  }

  // Check conversion rate
  if (data.analytics && data.analytics.conversionRate < 2) {
    recommendations.push({
      priority: 'high' as const,
      title: 'Low Conversion Rate',
      description: `Only ${data.analytics.conversionRate.toFixed(1)}% of visitors convert. This suggests UX or trust issues.`,
      impact: 'Improving conversion rate to 3% could add $10k/month revenue',
    });
  }

  // Check mobile traffic
  if (data.analytics) {
    const mobileDevice = data.analytics.deviceBreakdown.find((d) => d.device.toLowerCase().includes('mobile'));
    if (mobileDevice && mobileDevice.percentage > 60) {
      recommendations.push({
        priority: 'medium' as const,
        title: 'Optimize for Mobile',
        description: `${mobileDevice.percentage.toFixed(0)}% of your traffic is mobile. Ensure fast load times and easy navigation.`,
        impact: 'Mobile optimization can increase conversions by 20%',
      });
    }
  }

  return recommendations;
}

/**
 * Determine competitive position
 */
function determineCompetitivePosition(data: DealerDashboardData): 'leading' | 'competitive' | 'lagging' {
  const score = data.aiVisibilityScore;

  if (score >= 80) return 'leading';
  if (score >= 60) return 'competitive';
  return 'lagging';
}

/**
 * Demo data fallbacks
 */
function getDemoAnalyticsData() {
  return {
    sessions: 8452,
    users: 6234,
    newUsers: 4123,
    pageviews: 24567,
    bounceRate: 52.3,
    averageSessionDuration: 145,
    conversions: 234,
    conversionRate: 2.8,
    revenue: 45000,
    topPages: [
      { page: '/inventory', views: 5432 },
      { page: '/new-vehicles', views: 3421 },
      { page: '/used-vehicles', views: 2987 },
      { page: '/service', views: 1876 },
      { page: '/contact', views: 1543 },
    ],
    topSources: [
      { source: 'google', users: 3421 },
      { source: 'direct', users: 1876 },
      { source: 'facebook', users: 876 },
      { source: 'bing', users: 543 },
    ],
    deviceBreakdown: [
      { device: 'mobile', percentage: 65 },
      { device: 'desktop', percentage: 30 },
      { device: 'tablet', percentage: 5 },
    ],
  };
}

function getDemoGBPData() {
  return {
    name: 'Demo Dealership',
    rating: 4.6,
    totalReviews: 234,
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    website: 'https://example.com',
    businessStatus: 'OPERATIONAL',
    recentReviews: [
      {
        author: 'John D.',
        rating: 5,
        text: 'Great experience! Staff was friendly and helpful.',
        time: Date.now() / 1000 - 86400,
        relativeTime: '1 day ago',
      },
      {
        author: 'Sarah M.',
        rating: 4,
        text: 'Good service, fast turnaround.',
        time: Date.now() / 1000 - 172800,
        relativeTime: '2 days ago',
      },
    ],
    ratingDistribution: {
      5: 150,
      4: 60,
      3: 15,
      2: 6,
      1: 3,
    },
  };
}
