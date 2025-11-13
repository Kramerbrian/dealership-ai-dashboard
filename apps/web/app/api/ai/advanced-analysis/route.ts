import { NextRequest, NextResponse } from 'next/server';
import { AdvancedAIAnalysisService } from '@/lib/ai/advanced-analysis';

export async function POST(req: NextRequest) {
  try {
    const { dealership } = await req.json();

    if (!dealership) {
      return NextResponse.json({ error: 'Dealership is required' }, { status: 400 });
    }

    // Initialize the advanced AI analysis service
    const analysisService = new AdvancedAIAnalysisService({
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      google: process.env.GOOGLE_API_KEY || '',
      perplexity: process.env.PERPLEXITY_API_KEY || ''
    });

    // Perform multi-modal AI analysis
    const analysis = await analysisService.analyzeMultiModal(dealership);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Advanced AI analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform advanced AI analysis' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealership = searchParams.get('dealership');

    if (!dealership) {
      return NextResponse.json({ error: 'Dealership parameter is required' }, { status: 400 });
    }

    // Initialize the advanced AI analysis service
    const analysisService = new AdvancedAIAnalysisService({
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      google: process.env.GOOGLE_API_KEY || '',
      perplexity: process.env.PERPLEXITY_API_KEY || ''
    });

    // Perform multi-modal AI analysis
    const analysis = await analysisService.analyzeMultiModal(dealership);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Advanced AI analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform advanced AI analysis' },
      { status: 500 }
    );
  }
}
