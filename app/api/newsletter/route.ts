import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ga } from '@/lib/ga';

/**
 * POST /api/newsletter
 * 
 * Subscribe email to HubSpot newsletter
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const portalId = process.env.HUBSPOT_PORTAL_ID;
    const formGuid = process.env.HUBSPOT_FORM_GUID;

    if (!portalId || !formGuid) {
      await logger.warn('HubSpot not configured', {
        email,
      });
      
      // Graceful fallback - return success but don't actually send
      return NextResponse.json({
        success: true,
        message: 'Subscription received',
      });
    }

    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            {
              name: 'email',
              value: email,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      await logger.error('HubSpot subscription failed', {
        email,
        error: data,
      });
      
      return NextResponse.json(
        { error: 'Subscription failed', details: data },
        { status: response.status }
      );
    }

    await logger.info('Newsletter subscription', {
      email,
      source: 'landing_page',
    });

    // Track GA event
    if (typeof window !== 'undefined') {
      ga('newsletter_subscribe', { email });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed',
    });
  } catch (error) {
    await logger.error('Newsletter API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

