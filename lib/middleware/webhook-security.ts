/**
 * Webhook Security Middleware
 * Handles webhook signature verification for Stripe and Clerk
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { Webhook } from 'svix';

/**
 * Verify Stripe webhook signature
 */
export async function verifyStripeWebhook(
  req: NextRequest
): Promise<{ success: true; event: Stripe.Event } | { success: false; response: NextResponse }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Stripe webhook secret not configured',
        },
        { status: 503 }
      ),
    };
  }

  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'No signature provided',
          },
          { status: 400 }
        ),
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    return { success: true, event };
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid signature',
          message: error instanceof Error ? error.message : 'Signature verification failed',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Verify Clerk webhook signature
 */
export async function verifyClerkWebhook(
  req: NextRequest
): Promise<{ success: true; event: any } | { success: false; response: NextResponse }> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Clerk webhook secret not configured',
        },
        { status: 503 }
      ),
    };
  }

  try {
    const headersList = headers();
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'Missing svix headers',
          },
          { status: 400 }
        ),
      };
    }

    const body = await req.text();
    const wh = new Webhook(webhookSecret);

    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;

    return { success: true, event: evt };
  } catch (error) {
    console.error('Clerk webhook signature verification failed:', error);
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid signature',
          message: error instanceof Error ? error.message : 'Signature verification failed',
        },
        { status: 400 }
      ),
    };
  }
}

