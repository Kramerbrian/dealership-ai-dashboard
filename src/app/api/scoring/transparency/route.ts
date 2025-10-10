import { NextRequest, NextResponse } from 'next/server';
import { scoringEngine } from '@/core/scoring-engine';

/**
 * GET /api/scoring/transparency
 * Returns transparency report showing what we actually track
 */
export async function GET(request: NextRequest) {
  try {
    const transparencyReport = await scoringEngine.getTransparencyReport();
    
    return NextResponse.json({
      success: true,
      data: transparencyReport,
      message: 'Transparency report generated successfully'
    });
  } catch (error) {
    console.error('Error generating transparency report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate transparency report',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
