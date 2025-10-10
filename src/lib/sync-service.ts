import { createClient } from '@supabase/supabase-js';

// Create admin client for background operations
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (url && key) {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    console.warn('Supabase environment variables not set, using mock client');
    return {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
        delete: () => ({ data: [], error: null }),
        eq: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: null }),
      }),
      auth: {
        getUser: () => ({ data: { user: null }, error: null }),
        signIn: () => ({ data: { user: null }, error: null }),
        signOut: () => ({ error: null }),
      },
    };
  }
}

export async function syncDealerMetrics(dealerId: string) {
  const supabase = createAdminClient();
  
  try {
    // Fetch from external APIs
    const [gaData, semrushData, reviewData] = await Promise.all([
      fetchGoogleAnalytics(dealerId),
      fetchSEMrushData(dealerId),
      fetchReviewData(dealerId),
    ]);
    
    // Calculate derived metrics
    const metrics = {
      dealer_id: dealerId,
      revenue_at_risk: calculateRevenueAtRisk(gaData, semrushData),
      ai_visibility_score: calculateAIVisibility(semrushData),
      monthly_mentions: semrushData.mentions || 0,
      conversion_rate: gaData.conversionRate || 0,
      voice_search_ready: calculateVoiceReadiness(gaData),
      image_ai_score: calculateImageAIScore(semrushData),
      schema_health: await checkSchemaHealth(dealerId),
      ymyl_score: await calculateYMYLScore(dealerId),
      faq_coverage: await calculateFAQCoverage(dealerId),
      avg_rating: reviewData.avgRating,
      response_rate: reviewData.responseRate,
      new_reviews: reviewData.newReviews,
      updated_at: new Date().toISOString(),
    };
    
    // Upsert to database
    const { error } = await supabase
      .from('dealer_metrics')
      .upsert(metrics, { onConflict: 'dealer_id' });
    
    if (error) throw error;
    
    // Also insert into history table
    const { error: historyError } = await supabase
      .from('dealer_metrics_history')
      .upsert({
        dealer_id: dealerId,
        date: new Date().toISOString().split('T')[0],
        visibility_score: metrics.ai_visibility_score,
        mentions: metrics.monthly_mentions,
        revenue: metrics.revenue_at_risk,
      }, { onConflict: 'dealer_id,date' });
    
    if (historyError) throw historyError;
    
    console.log(`Synced metrics for dealer ${dealerId}`);
    return metrics;
    
  } catch (error) {
    console.error(`Failed to sync metrics for ${dealerId}:`, error);
    throw error;
  }
}

async function fetchGoogleAnalytics(dealerId: string) {
  // Mock implementation - replace with real GA4 API
  return {
    sessions: Math.floor(Math.random() * 1000) + 500,
    conversions: Math.floor(Math.random() * 100) + 50,
    conversionRate: Math.random() * 10 + 5,
    deviceCategory: 'mobile',
  };
}

async function fetchSEMrushData(dealerId: string) {
  // Mock implementation - replace with real SEMrush API
  return {
    mentions: Math.floor(Math.random() * 50) + 20,
    aiVisibility: Math.floor(Math.random() * 30) + 70,
    organicTraffic: Math.floor(Math.random() * 500) + 200,
  };
}

async function fetchReviewData(dealerId: string) {
  // Mock implementation - replace with real review APIs
  return {
    avgRating: Math.random() * 2 + 3, // 3.0 to 5.0
    responseRate: Math.floor(Math.random() * 40) + 40, // 40-80%
    newReviews: Math.floor(Math.random() * 50) + 20,
  };
}

function calculateRevenueAtRisk(gaData: any, semrushData: any) {
  const visibilityGap = 100 - (semrushData.aiVisibility || 0);
  const avgDealValue = 35000;
  const monthlyLeads = gaData.conversions || 0;
  
  return (visibilityGap / 100) * monthlyLeads * avgDealValue * 0.03;
}

function calculateAIVisibility(semrushData: any) {
  return semrushData.aiVisibility || 75;
}

function calculateVoiceReadiness(gaData: any) {
  // Mock calculation based on mobile traffic and local search
  const mobilePercentage = gaData.deviceCategory === 'mobile' ? 0.7 : 0.3;
  return Math.floor(mobilePercentage * 100);
}

function calculateImageAIScore(semrushData: any) {
  // Mock calculation based on image optimization
  return Math.floor(Math.random() * 20) + 80;
}

async function checkSchemaHealth(dealerId: string) {
  // Mock implementation - replace with real schema validation
  return Math.floor(Math.random() * 20) + 70;
}

async function calculateYMYLScore(dealerId: string) {
  // Mock implementation - replace with real YMYL analysis
  return Math.floor(Math.random() * 30) + 50;
}

async function calculateFAQCoverage(dealerId: string) {
  // Mock implementation - replace with real FAQ analysis
  return Math.floor(Math.random() * 30) + 60;
}
