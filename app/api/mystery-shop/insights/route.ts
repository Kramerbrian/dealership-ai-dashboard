import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mystery-shop/insights
 * Mystery Shop AI Insights
 * Generates competitive and predictive insights using plugin architecture
 */

interface MysteryShopData {
  competitors?: Array<{ name: string; price: number; responseTime: number }>;
  pricing?: { current: number };
  avgResponseTime?: number;
  dailyVolume?: number[];
  conversionHistory?: number[];
  hourlyData?: number[];
  responseQuality?: { excellent: number; good: number; fair: number; poor: number };
  weeklyPattern?: number[];
}

interface Insight {
  type: 'opportunity' | 'warning' | 'trend' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

export async function POST(req: NextRequest) {
  try {
    const data: MysteryShopData = await req.json();
    const insights: Insight[] = [];

    // Plugin 1: Competitive Analysis
    if (data.competitors && data.pricing?.current) {
      const avgCompetitorPrice = data.competitors.reduce((sum, comp) => sum + comp.price, 0) / data.competitors.length;
      const priceAdvantage = ((avgCompetitorPrice - data.pricing.current) / avgCompetitorPrice * 100);

      if (priceAdvantage > 5) {
        insights.push({
          type: 'opportunity',
          title: 'Price Advantage Detected',
          description: `You're ${priceAdvantage.toFixed(1)}% below competitors. Potential $${(priceAdvantage * data.pricing.current / 100).toFixed(0)} advantage per unit.`,
          confidence: 0.89,
          action: 'Highlight competitive pricing in marketing',
        });
      }

      // Response time analysis
      if (data.avgResponseTime && data.competitors.length > 0) {
        const competitorAvg = data.competitors.reduce((sum, comp) => sum + comp.responseTime, 0) / data.competitors.length;
        if (data.avgResponseTime < competitorAvg * 0.8) {
          insights.push({
            type: 'opportunity',
            title: 'Speed Advantage',
            description: `Your ${data.avgResponseTime}min response time is 20%+ faster than competitors (${competitorAvg.toFixed(1)}min avg).`,
            confidence: 0.94,
            action: 'Emphasize quick response time as differentiator',
          });
        }
      }
    }

    // Plugin 2: Predictive Analytics
    if (data.dailyVolume && data.dailyVolume.length >= 7) {
      const recentTrend = calculateTrend(data.dailyVolume.slice(-7));
      const prediction = data.dailyVolume[data.dailyVolume.length - 1] + recentTrend * 7;

      insights.push({
        type: 'prediction',
        title: 'Next Week Volume Forecast',
        description: `Based on current trend, expecting ${Math.round(prediction)} inquiries next week (${recentTrend > 0 ? '+' : ''}${(recentTrend * 7).toFixed(0)} vs this week).`,
        confidence: 0.76,
        action: recentTrend > 0 ? 'Prepare for increased demand' : 'Optimize for efficiency',
      });
    }

    // Plugin 3: Opportunity Detection
    if (data.hourlyData && data.hourlyData.length === 24) {
      const avgHourly = data.hourlyData.reduce((a, b) => a + b, 0) / 24;
      const peakHour = data.hourlyData.indexOf(Math.max(...data.hourlyData));
      const peakValue = data.hourlyData[peakHour];

      if (peakValue > avgHourly * 1.5) {
        insights.push({
          type: 'opportunity',
          title: 'Peak Hour Optimization',
          description: `Hour ${peakHour}:00 shows ${((peakValue / avgHourly - 1) * 100).toFixed(0)}% higher activity. Staffing optimization could improve response times.`,
          confidence: 0.85,
          action: `Consider additional coverage during ${peakHour}:00-${peakHour + 1}:00`,
        });
      }
    }

    // Response quality opportunity
    if (data.responseQuality && data.responseQuality.poor > 0) {
      const totalResponses = Object.values(data.responseQuality).reduce((a, b) => a + b, 0);
      const poorPercentage = (data.responseQuality.poor / totalResponses) * 100;

      if (poorPercentage > 10) {
        insights.push({
          type: 'opportunity',
          title: 'Quick Win: Response Quality',
          description: `${poorPercentage.toFixed(0)}% poor responses detected. Template optimization could improve ${data.responseQuality.poor} responses immediately.`,
          confidence: 0.92,
          action: 'Implement response templates and training',
        });
      }
    }

    // Sort by confidence and return top insights
    const sortedInsights = insights
      .filter(insight => insight.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      insights: sortedInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Mystery Shop insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

/**
 * Calculate linear regression trend
 */
function calculateTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  return (n * sumXY - sumX * sumY) / denominator;
}

