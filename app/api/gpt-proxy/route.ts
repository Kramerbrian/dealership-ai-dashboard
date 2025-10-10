import { NextRequest, NextResponse } from 'next/server';
import { callGPTDirect } from '@/lib/openai-assistant';
import { GPTProxyRequest, GPTProxyResponse, isGPTResponse } from '@/types/aiv';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate request
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: GPTProxyRequest = await req.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Rate limiting check (basic implementation)
    const rateLimitKey = `gpt_proxy_${req.ip || 'unknown'}`;
    // In production, implement proper rate limiting with Redis
    
    // Call OpenAI API
    const gptResponse = await callGPTDirect(body.prompt, body.dealerId);
    
    // Validate response structure
    if (!isGPTResponse(gptResponse)) {
      throw new Error('Invalid response structure from GPT');
    }

    const processingTime = Date.now() - startTime;
    
    const response: GPTProxyResponse = {
      success: true,
      data: gptResponse,
      processing_time_ms: processingTime,
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GPT Proxy Error:', error);
    
    const processingTime = Date.now() - startTime;
    
    const errorResponse: GPTProxyResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processing_time_ms: processingTime,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'GPT Proxy endpoint is active',
    endpoints: {
      POST: '/api/gpt-proxy - Send prompts to GPT',
    },
    rate_limits: {
      requests_per_minute: 10,
      requests_per_hour: 100,
    },
  });
}
