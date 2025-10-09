import { NextRequest, NextResponse } from 'next/server';
import { aiScanner } from '@/lib/ai-scanner';

export async function POST(request: NextRequest) {
  try {
    const { dealers, scanDate } = await request.json();
    
    if (!dealers || !Array.isArray(dealers)) {
      return NextResponse.json(
        { error: 'Invalid dealers data' },
        { status: 400 }
      );
    }

    console.log(`Processing batch with ${dealers.length} dealers for scan date: ${scanDate}`);

    // Scan all platforms for this batch
    const platforms = ['chatgpt', 'claude', 'perplexity', 'gemini', 'google-sge', 'grok'];
    const platformResults = [];

    for (const platform of platforms) {
      try {
        console.log(`Scanning ${platform} for ${dealers.length} dealers...`);
        
        const result = await aiScanner.scanPlatform(platform, dealers);
        platformResults.push(result);
        
        console.log(`${platform} scan completed:`, {
          mentions: result.mentions,
          avg_rank: result.avg_rank,
          cost: result.cost_usd
        });
        
        // Add delay between platforms to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error scanning ${platform}:`, error);
        // Continue with next platform
      }
    }

    // Calculate aggregate metrics for the batch
    const totalMentions = platformResults.reduce((sum, r) => sum + r.mentions, 0);
    const avgRank = platformResults.reduce((sum, r) => sum + r.avg_rank, 0) / platformResults.length;
    const sentimentScore = platformResults.reduce((sum, r) => sum + r.sentiment, 0) / platformResults.length;
    const totalCitations = platformResults.reduce((sum, r) => sum + r.citations.length, 0);
    const totalCost = platformResults.reduce((sum, r) => sum + r.cost_usd, 0);

    // Calculate visibility score for each dealer
    const dealerResults = dealers.map(dealer => {
      const dealerMentions = platformResults.reduce((sum, r) => {
        const dealerQueryResults = r.query_results.filter(qr => 
          qr.results.some(result => 
            result.dealership.toLowerCase().includes(dealer.name.toLowerCase()) ||
            dealer.name.toLowerCase().includes(result.dealership.toLowerCase())
          )
        );
        return sum + dealerQueryResults.reduce((qSum, qr) => qSum + qr.results.length, 0);
      }, 0);

      const dealerAvgRank = platformResults.reduce((sum, r) => {
        const dealerQueryResults = r.query_results.filter(qr => 
          qr.results.some(result => 
            result.dealership.toLowerCase().includes(dealer.name.toLowerCase()) ||
            dealer.name.toLowerCase().includes(result.dealership.toLowerCase())
          )
        );
        const ranks = dealerQueryResults.flatMap(qr => 
          qr.results.map(result => result.rank)
        );
        return sum + (ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0);
      }, 0) / platformResults.length;

      const dealerSentiment = platformResults.reduce((sum, r) => {
        const dealerQueryResults = r.query_results.filter(qr => 
          qr.results.some(result => 
            result.dealership.toLowerCase().includes(dealer.name.toLowerCase()) ||
            dealer.name.toLowerCase().includes(result.dealership.toLowerCase())
          )
        );
        const sentiments = dealerQueryResults.flatMap(qr => 
          qr.results.map(result => 
            result.sentiment === 'positive' ? 1 : 
            result.sentiment === 'negative' ? -1 : 0
          )
        );
        return sum + (sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0);
      }, 0) / platformResults.length;

      const dealerCitations = platformResults.reduce((sum, r) => {
        const dealerQueryResults = r.query_results.filter(qr => 
          qr.results.some(result => 
            result.dealership.toLowerCase().includes(dealer.name.toLowerCase()) ||
            dealer.name.toLowerCase().includes(result.dealership.toLowerCase())
          )
        );
        return sum + dealerQueryResults.reduce((qSum, qr) => 
          qSum + qr.results.reduce((cSum, result) => cSum + (result.citations?.length || 0), 0), 0
        );
      }, 0);

      // Calculate visibility score
      const mentionScore = Math.min(dealerMentions / 10 * 40, 40);
      const rankScore = Math.max(0, 30 - (dealerAvgRank - 1) * 5);
      const sentimentScore = (dealerSentiment + 1) / 2 * 20;
      const citationScore = Math.min(dealerCitations / 5 * 10, 10);
      
      const visibilityScore = Math.round(
        Math.min(100, Math.max(0, mentionScore + rankScore + sentimentScore + citationScore))
      );

      return {
        dealer_id: dealer.id,
        dealer_name: dealer.name,
        visibility_score: visibilityScore,
        mentions: dealerMentions,
        avg_rank: dealerAvgRank,
        sentiment_score: dealerSentiment,
        citations: dealerCitations,
        platform_breakdown: platformResults.map(pr => ({
          platform: pr.platform,
          mentions: pr.mentions,
          avg_rank: pr.avg_rank,
          sentiment: pr.sentiment,
          cost: pr.cost_usd
        }))
      };
    });

    // Save results to database (mock implementation)
    await saveBatchResults(dealerResults, scanDate);

    return NextResponse.json({
      success: true,
      message: 'Batch scan completed successfully',
      results: {
        dealers_processed: dealers.length,
        platforms_scanned: platformResults.length,
        total_mentions: totalMentions,
        avg_visibility_score: Math.round(
          dealerResults.reduce((sum, r) => sum + r.visibility_score, 0) / dealerResults.length
        ),
        total_cost: totalCost,
        scan_date: scanDate
      },
      dealer_results: dealerResults
    });

  } catch (error) {
    console.error('Batch scan error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Batch scan failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock function to save batch results
async function saveBatchResults(dealerResults: any[], scanDate: string) {
  console.log(`Saving batch results for ${dealerResults.length} dealers...`);
  
  for (const result of dealerResults) {
    console.log(`Saving results for ${result.dealer_name}:`, {
      visibility_score: result.visibility_score,
      mentions: result.mentions,
      avg_rank: result.avg_rank
    });
    
    // In production, this would save to:
    // - monthly_scans table
    // - platform_results table
    // - query_results table
    // - competitor_analysis table
  }
  
  console.log('Batch results saved successfully');
}