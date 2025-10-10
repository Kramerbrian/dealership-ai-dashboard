import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AIVisibilityMetrics {
  sourceId: string;
  platform: string;
  category: string;
  visibility: number;
  engagement: number;
  reach: number;
  sentiment: number;
  conversion: number;
  authority: number;
  influence: number;
  growth: number;
  timestamp: string;
  metadata: {
    demographics: any;
    cost: any;
    competitors: any[];
    insights: string[];
    recommendations: string[];
  };
}

interface AggregatedMetrics {
  totalSources: number;
  activeSources: number;
  averageVisibility: number;
  totalReach: number;
  engagementRate: number;
  sentimentScore: number;
  coverageScore: number;
  conversionRate: number;
  authorityScore: number;
  influenceScore: number;
  growthRate: number;
  costEfficiency: number;
  competitorGap: number;
  marketShare: number;
  aiReadiness: number;
  categoryBreakdown: {
    [category: string]: {
      count: number;
      avgVisibility: number;
      totalReach: number;
      avgEngagement: number;
    };
  };
  topPerformingSources: AIVisibilityMetrics[];
  trendingSources: AIVisibilityMetrics[];
  recommendations: string[];
  alerts: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const category = searchParams.get('category') || 'all';
    const timeframe = searchParams.get('timeframe') || '7d';

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    // Calculate date range based on timeframe
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch AI visibility metrics from database
    let query = supabase
      .from('ai_visibility_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: metrics, error } = await query;

    if (error) {
      console.error('Error fetching AI visibility metrics:', error);
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }

    // If no data in database, return mock data for development
    if (!metrics || metrics.length === 0) {
      const mockMetrics = generateMockMetrics(tenantId, category, timeframe);
      return NextResponse.json(mockMetrics);
    }

    // Process and aggregate the metrics
    const aggregatedMetrics = aggregateMetrics(metrics as AIVisibilityMetrics[]);
    
    return NextResponse.json(aggregatedMetrics);
  } catch (error) {
    console.error('AI Visibility API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId, sourceId, metrics } = await req.json();

    if (!tenantId || !sourceId || !metrics) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Insert or update AI visibility metrics
    const { error } = await supabase
      .from('ai_visibility_metrics')
      .upsert({
        tenant_id: tenantId,
        source_id: sourceId,
        platform: metrics.platform,
        category: metrics.category,
        visibility: metrics.visibility,
        engagement: metrics.engagement,
        reach: metrics.reach,
        sentiment: metrics.sentiment,
        conversion: metrics.conversion,
        authority: metrics.authority,
        influence: metrics.influence,
        growth: metrics.growth,
        timestamp: new Date().toISOString(),
        metadata: metrics.metadata
      });

    if (error) {
      console.error('Error saving AI visibility metrics:', error);
      return NextResponse.json({ error: 'Failed to save metrics' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Metrics saved successfully' });
  } catch (error) {
    console.error('AI Visibility API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateMockMetrics(tenantId: string, category: string, timeframe: string): AggregatedMetrics {
  const sources = [
    { id: 'linkedin', platform: 'LinkedIn', category: 'professional' },
    { id: 'tiktok', platform: 'TikTok', category: 'video' },
    { id: 'instagram', platform: 'Instagram', category: 'social' },
    { id: 'voice-assistants', platform: 'Voice Assistants', category: 'voice' },
    { id: 'google-search', platform: 'Google Search', category: 'search' },
    { id: 'openai-chatgpt', platform: 'OpenAI ChatGPT', category: 'ai' },
    { id: 'shopify', platform: 'Shopify', category: 'ecommerce' },
    { id: 'anthropic-claude', platform: 'Anthropic Claude', category: 'ai' }
  ];

  const filteredSources = category === 'all' ? sources : sources.filter(s => s.category === category);
  
  const mockMetrics: AIVisibilityMetrics[] = filteredSources.map(source => ({
    sourceId: source.id,
    platform: source.platform,
    category: source.category,
    visibility: Math.floor(Math.random() * 40) + 60,
    engagement: Math.floor(Math.random() * 30) + 50,
    reach: Math.floor(Math.random() * 5000) + 1000,
    sentiment: Math.floor(Math.random() * 30) + 70,
    conversion: Math.floor(Math.random() * 20) + 10,
    authority: Math.floor(Math.random() * 30) + 60,
    influence: Math.floor(Math.random() * 40) + 50,
    growth: Math.floor(Math.random() * 50) + 10,
    timestamp: new Date().toISOString(),
    metadata: {
      demographics: {
        age: { '25-34': 35, '35-44': 40, '45-54': 20, '55+': 5 },
        gender: { male: 55, female: 45 },
        location: { 'North America': 60, 'Europe': 25, 'Asia': 15 }
      },
      cost: {
        monthly: Math.floor(Math.random() * 500) + 100,
        cpm: Math.random() * 20 + 5,
        cpc: Math.random() * 5 + 1
      },
      competitors: [
        { name: 'Competitor A', visibility: Math.floor(Math.random() * 20) + 70 },
        { name: 'Competitor B', visibility: Math.floor(Math.random() * 20) + 65 }
      ],
      insights: [
        `${source.platform} posts about electric vehicles are performing 40% better`,
        `Your ${source.platform} engagement increased 25% this month`,
        `Industry-specific content gets 3x more engagement on ${source.platform}`
      ],
      recommendations: [
        `Post 3x per week on ${source.platform} for optimal engagement`,
        `Use ${source.platform} Analytics to track performance`,
        `Engage with industry leaders' content on ${source.platform}`
      ]
    }
  }));

  return aggregateMetrics(mockMetrics);
}

function aggregateMetrics(metrics: AIVisibilityMetrics[]): AggregatedMetrics {
  const totalSources = metrics.length;
  const activeSources = metrics.filter(m => m.visibility > 0).length;
  
  const averageVisibility = metrics.reduce((sum, m) => sum + m.visibility, 0) / totalSources;
  const totalReach = metrics.reduce((sum, m) => sum + m.reach, 0);
  const engagementRate = metrics.reduce((sum, m) => sum + m.engagement, 0) / totalSources;
  const sentimentScore = metrics.reduce((sum, m) => sum + m.sentiment, 0) / totalSources;
  const conversionRate = metrics.reduce((sum, m) => sum + m.conversion, 0) / totalSources;
  const authorityScore = metrics.reduce((sum, m) => sum + m.authority, 0) / totalSources;
  const influenceScore = metrics.reduce((sum, m) => sum + m.influence, 0) / totalSources;
  const growthRate = metrics.reduce((sum, m) => sum + m.growth, 0) / totalSources;
  
  const coverageScore = (averageVisibility + engagementRate + sentimentScore) / 3;
  const costEfficiency = (conversionRate * 100) / (metrics.reduce((sum, m) => sum + m.metadata.cost.monthly, 0) / totalSources);
  const competitorGap = metrics.reduce((sum, m) => {
    const avgCompetitorVisibility = m.metadata.competitors.reduce((acc, c) => acc + c.visibility, 0) / m.metadata.competitors.length;
    return sum + (avgCompetitorVisibility - m.visibility);
  }, 0) / totalSources;
  
  const marketShare = (totalReach / 100000) * 100; // Assuming 100K is total market reach
  const aiReadiness = (authorityScore + influenceScore + growthRate) / 3;

  // Category breakdown
  const categoryBreakdown = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = { count: 0, avgVisibility: 0, totalReach: 0, avgEngagement: 0 };
    }
    acc[metric.category].count++;
    acc[metric.category].avgVisibility += metric.visibility;
    acc[metric.category].totalReach += metric.reach;
    acc[metric.category].avgEngagement += metric.engagement;
    return acc;
  }, {} as any);

  // Calculate averages for categories
  Object.keys(categoryBreakdown).forEach(category => {
    const cat = categoryBreakdown[category];
    cat.avgVisibility = Math.round(cat.avgVisibility / cat.count);
    cat.avgEngagement = Math.round(cat.avgEngagement / cat.count);
  });

  // Top performing sources (by visibility)
  const topPerformingSources = [...metrics]
    .sort((a, b) => b.visibility - a.visibility)
    .slice(0, 5);

  // Trending sources (by growth)
  const trendingSources = [...metrics]
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5);

  // Generate recommendations
  const recommendations = [
    `Focus on ${topPerformingSources[0]?.platform} for maximum visibility`,
    `Improve engagement on ${metrics.find(m => m.engagement < 50)?.platform || 'underperforming platforms'}`,
    `Consider expanding to ${categoryBreakdown.ai ? 'AI platforms' : 'voice assistants'} for better coverage`,
    `Optimize content for ${metrics.find(m => m.sentiment < 70)?.platform || 'platforms with low sentiment'}`
  ];

  // Generate alerts
  const alerts = [];
  if (coverageScore < 70) alerts.push('AI coverage score is below optimal level');
  if (competitorGap > 10) alerts.push('Competitive gap is widening - consider strategy adjustment');
  if (costEfficiency < 50) alerts.push('Cost efficiency is low - review spending allocation');
  if (aiReadiness < 60) alerts.push('AI readiness needs improvement for better automation');

  return {
    totalSources,
    activeSources,
    averageVisibility: Math.round(averageVisibility),
    totalReach,
    engagementRate: Math.round(engagementRate),
    sentimentScore: Math.round(sentimentScore),
    coverageScore: Math.round(coverageScore),
    conversionRate: Math.round(conversionRate),
    authorityScore: Math.round(authorityScore),
    influenceScore: Math.round(influenceScore),
    growthRate: Math.round(growthRate),
    costEfficiency: Math.round(costEfficiency),
    competitorGap: Math.round(competitorGap),
    marketShare: Math.round(marketShare),
    aiReadiness: Math.round(aiReadiness),
    categoryBreakdown,
    topPerformingSources,
    trendingSources,
    recommendations,
    alerts
  };
}
