/**
 * Scan Batch Processor
 * Processes a batch of dealers through all AI platforms
 */

import { createClient } from '@supabase/supabase-js';
import { scanAllPlatforms, calculateVisibilityScore, type Dealer } from './ai-scanner';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ScanBatchRequest {
  batchId: string;
  dealers: Dealer[];
  scanDate: string;
}

export interface ScanBatchResult {
  batchId: string;
  success: boolean;
  processedDealers: number;
  totalCost: number;
  processingTimeMs: number;
  error?: string;
}

/**
 * Update batch status in database
 */
async function updateBatchStatus(
  batchId: string, 
  status: 'processing' | 'completed' | 'failed',
  errorMessage?: string,
  totalCost?: number
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'processing') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    if (totalCost) updateData.total_cost_usd = totalCost;
  } else if (status === 'failed') {
    updateData.completed_at = new Date().toISOString();
    if (errorMessage) updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('scan_batches')
    .update(updateData)
    .eq('id', batchId);

  if (error) {
    console.error('Error updating batch status:', error);
  }
}

/**
 * Create monthly scan record for a dealer
 */
async function createMonthlyScan(dealerId: string, scanDate: string) {
  const { data, error } = await supabase
    .from('monthly_scans')
    .insert({
      dealer_id: dealerId,
      scan_date: scanDate,
      scan_status: 'processing',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating monthly scan:', error);
    throw new Error(`Failed to create monthly scan for dealer ${dealerId}`);
  }

  return data;
}

/**
 * Save platform results to database
 */
async function savePlatformResults(
  scanId: string,
  platformResults: any[],
  batchId: string
) {
  const resultsToInsert = platformResults.map(result => ({
    scan_id: scanId,
    platform: result.platform,
    mentions: result.totalMentions,
    avg_rank: result.avgRank,
    sentiment_score: result.sentimentScore,
    citations: result.queryResults.flatMap((qr: any) => qr.citations),
    response_data: result.queryResults,
    processing_time_ms: result.processingTimeMs,
    api_cost_usd: result.apiCostUsd,
  }));

  const { error } = await supabase
    .from('platform_results')
    .insert(resultsToInsert);

  if (error) {
    console.error('Error saving platform results:', error);
    throw new Error('Failed to save platform results');
  }
}

/**
 * Save query results to database
 */
async function saveQueryResults(
  scanId: string,
  dealerId: string,
  platformResults: any[]
) {
  const queryResultsToInsert: any[] = [];

  for (const platformResult of platformResults) {
    for (const queryResult of platformResult.queryResults) {
      // Get query ID
      const { data: query } = await supabase
        .from('tracked_queries')
        .select('id')
        .eq('query_text', queryResult.query)
        .single();

      if (query) {
        queryResultsToInsert.push({
          query_id: query.id,
          dealer_id: dealerId,
          scan_id: scanId,
          platform: platformResult.platform,
          rank: queryResult.rank,
          mentioned: queryResult.mentioned,
          sentiment: queryResult.sentiment,
          confidence_score: queryResult.confidence,
          citation_urls: queryResult.citations,
        });
      }
    }
  }

  if (queryResultsToInsert.length > 0) {
    const { error } = await supabase
      .from('query_results')
      .insert(queryResultsToInsert);

    if (error) {
      console.error('Error saving query results:', error);
      throw new Error('Failed to save query results');
    }
  }
}

/**
 * Update monthly scan with final results
 */
async function updateMonthlyScan(
  scanId: string,
  visibilityScore: number,
  totalMentions: number,
  avgRank: number,
  sentimentScore: number,
  totalCitations: number
) {
  const { error } = await supabase
    .from('monthly_scans')
    .update({
      visibility_score: visibilityScore,
      total_mentions: totalMentions,
      avg_rank: avgRank,
      sentiment_score: sentimentScore,
      total_citations: totalCitations,
      scan_status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', scanId);

  if (error) {
    console.error('Error updating monthly scan:', error);
    throw new Error('Failed to update monthly scan');
  }
}

/**
 * Track API usage for cost monitoring
 */
async function trackAPIUsage(
  scanId: string,
  platformResults: any[]
) {
  const usageToInsert = platformResults.map(result => ({
    platform: result.platform,
    scan_id: scanId,
    total_tokens: Math.ceil(result.queryResults.length * 100), // Rough estimate
    cost_usd: result.apiCostUsd,
    model_used: result.platform,
  }));

  const { error } = await supabase
    .from('api_usage')
    .insert(usageToInsert);

  if (error) {
    console.error('Error tracking API usage:', error);
    // Don't throw error for usage tracking failures
  }
}

/**
 * Process a single dealer through all platforms
 */
async function processDealer(
  dealer: Dealer,
  queries: string[],
  scanDate: string
): Promise<{
  dealerId: string;
  scanId: string;
  visibilityScore: number;
  totalCost: number;
  processingTimeMs: number;
}> {
  const startTime = Date.now();
  
  // Create monthly scan record
  const scan = await createMonthlyScan(dealer.id, scanDate);
  
  try {
    // Scan all platforms
    const platformResults = await scanAllPlatforms([dealer], queries);
    
    // Calculate visibility score
    const scoreData = calculateVisibilityScore(platformResults, dealer.name);
    
    // Save platform results
    await savePlatformResults(scan.id, platformResults, '');
    
    // Save query results
    await saveQueryResults(scan.id, dealer.id, platformResults);
    
    // Update monthly scan with final results
    await updateMonthlyScan(
      scan.id,
      scoreData.visibilityScore,
      scoreData.totalMentions,
      scoreData.avgRank,
      scoreData.sentimentScore,
      scoreData.totalCitations
    );
    
    // Track API usage
    await trackAPIUsage(scan.id, platformResults);
    
    const processingTime = Date.now() - startTime;
    const totalCost = platformResults.reduce((sum, pr) => sum + pr.apiCostUsd, 0);
    
    return {
      dealerId: dealer.id,
      scanId: scan.id,
      visibilityScore: scoreData.visibilityScore,
      totalCost,
      processingTimeMs: processingTime,
    };
    
  } catch (error) {
    // Update scan status to failed
    await supabase
      .from('monthly_scans')
      .update({
        scan_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', scan.id);
    
    throw error;
  }
}

/**
 * Get tracked queries for scanning
 */
async function getTrackedQueries(): Promise<string[]> {
  const { data: queries, error } = await supabase
    .from('tracked_queries')
    .select('query_text')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching queries:', error);
    throw new Error('Failed to fetch tracked queries');
  }

  return queries?.map(q => q.query_text) || [];
}

/**
 * Main batch processing function
 */
export async function processScanBatch(request: ScanBatchRequest): Promise<ScanBatchResult> {
  const { batchId, dealers, scanDate } = request;
  const startTime = Date.now();
  
  try {
    console.log(`Processing batch ${batchId} with ${dealers.length} dealers`);
    
    // Update batch status to processing
    await updateBatchStatus(batchId, 'processing');
    
    // Get tracked queries
    const queries = await getTrackedQueries();
    console.log(`Using ${queries.length} tracked queries`);
    
    // Process each dealer
    const dealerResults: any[] = [];
    let totalCost = 0;

    for (const dealer of dealers) {
      try {
        console.log(`Processing dealer: ${dealer.name}`);
        const result = await processDealer(dealer, queries, scanDate);
        dealerResults.push(result);
        totalCost += result.totalCost;
        
        console.log(`Completed dealer: ${dealer.name} (Score: ${result.visibilityScore})`);
      } catch (error) {
        console.error(`Failed to process dealer ${dealer.name}:`, error);
        // Continue with other dealers
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Update batch status to completed
    await updateBatchStatus(batchId, 'completed', undefined, totalCost);
    
    console.log(`Batch ${batchId} completed: ${dealerResults.length}/${dealers.length} dealers processed`);
    
    return {
      batchId,
      success: true,
      processedDealers: dealerResults.length,
      totalCost,
      processingTimeMs: processingTime,
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`Batch ${batchId} failed:`, error);
    
    // Update batch status to failed
    await updateBatchStatus(batchId, 'failed', errorMessage);
    
    return {
      batchId,
      success: false,
      processedDealers: 0,
      totalCost: 0,
      processingTimeMs: processingTime,
      error: errorMessage,
    };
  }
}
