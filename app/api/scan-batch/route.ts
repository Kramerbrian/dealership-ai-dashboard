/**
 * Scan Batch API Endpoint
 * Processes a batch of dealers through AI platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScanBatch } from '@/lib/scan-batch-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchId, dealers, scanDate } = body;

    // Validate request
    if (!batchId || !dealers || !Array.isArray(dealers) || !scanDate) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: batchId, dealers array, and scanDate are required',
      }, { status: 400 });
    }

    console.log(`Received batch processing request: ${batchId} with ${dealers.length} dealers`);

    // Process the batch
    const result = await processScanBatch({
      batchId,
      dealers,
      scanDate,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Batch processed successfully',
        data: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Batch processing failed',
        data: result,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Batch processing error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Scan batch processor is running',
    timestamp: new Date().toISOString(),
  });
}
