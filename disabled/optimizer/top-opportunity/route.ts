import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiOptimizerEngine, dealershipAIOptimizerFunctionSchema } from '../../../../src/lib/optimizer/ai-optimizer-engine';

// Request validation schema
const TopOpportunityRequestSchema = z.object({
  dealership_name: z.string().min(1).max(100),
  month: z.string().min(1).max(20),
  tenant_id: z.string().min(1),
  dealer_id: z.string().optional(),
  current_scores: z.object({
    ai_visibility: z.number().min(0).max(100).optional(),
    zero_click: z.number().min(0).max(100).optional(),
    ugc_health: z.number().min(0).max(100).optional(),
    geo_trust: z.number().min(0).max(100).optional(),
    sgp_integrity: z.number().min(0).max(100).optional(),
    overall: z.number().min(0).max(100).optional(),
  }).optional(),
  created_by: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const validatedRequest = TopOpportunityRequestSchema.parse(body);
    
    // Generate top SEO opportunity
    const opportunity = await aiOptimizerEngine.generateTopSEOOpportunity(
      validatedRequest.dealership_name,
      validatedRequest.month,
      {
        tenant_id: validatedRequest.tenant_id,
        dealer_id: validatedRequest.dealer_id,
        current_scores: validatedRequest.current_scores || {
          ai_visibility: 0,
          zero_click: 0,
          ugc_health: 0,
          geo_trust: 0,
          sgp_integrity: 0,
          overall: 0,
        },
        created_by: validatedRequest.created_by,
      } as any
    );

    // Return response in the exact format expected by AI function calling
    return NextResponse.json({
      success: true,
      data: opportunity,
      schema: dealershipAIOptimizerFunctionSchema,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating top SEO opportunity:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SEO opportunity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealershipName = searchParams.get('dealership_name') || 'ABC Toyota';
  const month = searchParams.get('month') || 'October';
  const tenantId = searchParams.get('tenant_id') || 'test-tenant';

  try {
    const opportunity = await aiOptimizerEngine.generateTopSEOOpportunity(
      dealershipName,
      month,
      {
        tenant_id: tenantId,
        current_scores: {
          ai_visibility: 65,
          zero_click: 70,
          ugc_health: 75,
          geo_trust: 80,
          sgp_integrity: 85,
          overall: 75,
        },
        created_by: 'system',
      }
    );

    return NextResponse.json({
      success: true,
      data: opportunity,
      schema: dealershipAIOptimizerFunctionSchema,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in GET /api/optimizer/top-opportunity:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SEO opportunity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
