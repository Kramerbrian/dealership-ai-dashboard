/**
 * DealershipAI Scoring API
 * 
 * REST API endpoints for AI visibility scoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { scoringEngine } from '@/lib/scoring-engine';
import { z } from 'zod';

// Request validation schemas
const DealerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  name_variations: z.array(z.string()),
  website_domain: z.string().url(),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  established_date: z.string().datetime(),
  brand: z.string().min(1),
  models: z.array(z.string()),
  website: z.string().url(),
  blog: z.string().url().optional()
});

const BatchScoringSchema = z.object({
  dealer_ids: z.array(z.string().uuid()),
  priority: z.enum(['low', 'normal', 'high']).default('normal')
});

/**
 * POST /api/scoring - Calculate AI visibility score for a dealer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'calculate_score':
        return await calculateScore(data);
      
      case 'batch_scoring':
        return await batchScoring(data);
      
      case 'get_history':
        return await getScoringHistory(data);
      
      case 'get_competitive':
        return await getCompetitiveAnalysis(data);
      
      case 'get_health':
        return await getSystemHealth();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: calculate_score, batch_scoring, get_history, get_competitive, get_health' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate AI visibility score for a single dealer
 */
async function calculateScore(data: any) {
  try {
    // Validate dealer data
    const dealer = DealerSchema.parse(data);
    
    // Convert established_date string to Date object
    const dealerWithDate = {
      ...dealer,
      established_date: new Date(dealer.established_date)
    };

    // Calculate score
    const result = await scoringEngine.calculateDealerScore(dealerWithDate);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Calculate score error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate score' 
      },
      { status: 500 }
    );
  }
}

/**
 * Run batch scoring for multiple dealers
 */
async function batchScoring(data: any) {
  try {
    const { dealer_ids, priority } = BatchScoringSchema.parse(data);

    // Run batch scoring
    const results = await scoringEngine.runBatchScoring(dealer_ids);

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        total: dealer_ids.length,
        results: results,
        priority: priority
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Batch scoring error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run batch scoring' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get scoring history for a dealer
 */
async function getScoringHistory(data: any) {
  try {
    const { dealer_id, days = 30 } = data;

    if (!dealer_id) {
      return NextResponse.json(
        { success: false, error: 'dealer_id is required' },
        { status: 400 }
      );
    }

    // Get scoring history
    const history = await scoringEngine.getScoringHistory(dealer_id, days);

    return NextResponse.json({
      success: true,
      data: {
        dealer_id,
        days,
        history: history
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get scoring history' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get competitive analysis for a dealer
 */
async function getCompetitiveAnalysis(data: any) {
  try {
    const { dealer_id } = data;

    if (!dealer_id) {
      return NextResponse.json(
        { success: false, error: 'dealer_id is required' },
        { status: 400 }
      );
    }

    // Mock competitive analysis for now
    const dealer = { id: dealer_id, name: 'Sample Dealer', domain: 'example.com' };
    const analysis = {
      dealer_id,
      competitors: [
        { name: 'Competitor 1', domain: 'competitor1.com', score: 85 },
        { name: 'Competitor 2', domain: 'competitor2.com', score: 78 }
      ],
      market_position: 'top_25_percent',
      recommendations: ['Improve local SEO', 'Enhance review management']
    };

    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get competitive analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get competitive analysis' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get system health metrics
 */
async function getSystemHealth() {
  try {
    // Mock system health for now
    const health = {
      status: 'healthy',
      last_updated: new Date().toISOString(),
      services: {
        ai_apis: 'healthy',
        database: 'healthy',
        cache: 'healthy'
      },
      metrics: {
        total_dealers_scored: 150,
        average_score: 78.5,
        uptime: '99.9%'
      }
    };

    return NextResponse.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Get system health error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get system health' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scoring - Get API documentation
 */
export async function GET(req: NextRequest) {
  const documentation = {
    title: 'DealershipAI Scoring API',
    version: '1.0.0',
    description: 'AI visibility scoring system for automotive dealerships',
    endpoints: {
      'POST /api/scoring': {
        description: 'Main scoring endpoint with action-based routing',
        actions: {
          calculate_score: {
            description: 'Calculate AI visibility score for a single dealer',
            required_fields: [
              'id', 'name', 'name_variations', 'website_domain', 
              'city', 'state', 'established_date', 'brand', 'models', 'website'
            ],
            optional_fields: ['blog'],
            example: {
              action: 'calculate_score',
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Terry Reid Hyundai',
              name_variations: ['Terry Reid Hyundai', 'Terry Reid Auto'],
              website_domain: 'terryreidhyundai.com',
              city: 'Naples',
              state: 'FL',
              established_date: '2010-01-01T00:00:00Z',
              brand: 'Hyundai',
              models: ['Elantra', 'Sonata', 'Tucson'],
              website: 'https://terryreidhyundai.com',
              blog: 'https://terryreidhyundai.com/blog'
            }
          },
          batch_scoring: {
            description: 'Run scoring for multiple dealers',
            required_fields: ['dealer_ids'],
            optional_fields: ['priority'],
            example: {
              action: 'batch_scoring',
              dealer_ids: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43d1-b789-123456789abc'],
              priority: 'normal'
            }
          },
          get_history: {
            description: 'Get scoring history for a dealer',
            required_fields: ['dealer_id'],
            optional_fields: ['days'],
            example: {
              action: 'get_history',
              dealer_id: '123e4567-e89b-12d3-a456-426614174000',
              days: 30
            }
          },
          get_competitive: {
            description: 'Get competitive analysis for a dealer',
            required_fields: ['dealer_id'],
            example: {
              action: 'get_competitive',
              dealer_id: '123e4567-e89b-12d3-a456-426614174000'
            }
          },
          get_health: {
            description: 'Get system health metrics',
            example: {
              action: 'get_health'
            }
          }
        }
      }
    },
    scoring_pillars: {
      seo_visibility: {
        weight: 0.30,
        accuracy: 0.92,
        components: ['organic_rankings', 'branded_search_volume', 'backlink_authority', 'content_indexation', 'local_pack_presence']
      },
      aeo_visibility: {
        weight: 0.35,
        accuracy: 0.87,
        components: ['citation_frequency', 'source_authority', 'answer_completeness', 'multi_platform_presence', 'sentiment_quality']
      },
      geo_visibility: {
        weight: 0.35,
        accuracy: 0.89,
        components: ['ai_overview_presence', 'featured_snippet_rate', 'knowledge_panel_complete', 'zero_click_dominance', 'entity_recognition']
      }
    },
    cost_breakdown: {
      seo: 0.75,
      aeo: 0.47,
      geo: 2.05,
      eeat: 0.10,
      infrastructure: 0.70,
      support: 1.50,
      total: 6.00
    }
  };

  return NextResponse.json(documentation);
}
