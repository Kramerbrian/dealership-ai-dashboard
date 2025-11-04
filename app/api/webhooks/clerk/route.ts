/**
 * Clerk Webhook Handler
 * Syncs Clerk user events with Stripe customer creation and database
 * 
 * ✅ Migrated to new security middleware:
 * - Webhook signature verification (no auth required)
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { verifyClerkWebhook } from '@/lib/middleware/webhook-security';
import { billingManager } from '@/lib/stripe-billing';
import { userManager } from '@/lib/user-management';
import { errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Clerk webhook event types
type ClerkWebhookEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
};

export const POST = createApiRoute(
  {
    endpoint: '/api/webhooks/clerk',
    requireAuth: false, // Webhooks don't use auth, use signature verification
    rateLimit: true, // Rate limiting (prevents abuse)
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      // Verify webhook signature
      const verification = await verifyClerkWebhook(req);
      if (!verification.success) {
        return verification.response;
      }

      const evt = verification.event as ClerkWebhookEvent;

      // Handle the event
      const { type, data } = evt;
      const userId = data.id;
      const email = data.email_addresses?.[0]?.email_address;
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username;

      await logger.info('Clerk webhook event received', {
        requestId,
        eventType: type,
        userId,
      });

      try {
        switch (type) {
          case 'user.created':
            await handleUserCreated(userId, email, name);
            break;

          case 'user.updated':
            await handleUserUpdated(userId, email, name);
            break;

          case 'user.deleted':
            await handleUserDeleted(userId);
            break;

          default:
            await logger.warn('Unhandled Clerk webhook event type', {
              requestId,
              eventType: type,
            });
        }

        await logger.info('Clerk webhook event processed successfully', {
          requestId,
          eventType: type,
          userId,
        });

        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        await logger.error('Error handling Clerk webhook event', {
          requestId,
          eventType: type,
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        return errorResponse(error, 500, {
          requestId,
          endpoint: '/api/webhooks/clerk',
          eventType: type,
        });
      }
    } catch (error) {
      await logger.error('Clerk webhook error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/webhooks/clerk',
      });
    }
  }
);

// Handle user.created event
async function handleUserCreated(userId: string, email: string, name?: string) {
  await logger.info('Handling user.created event', { userId, email });

  // 1. Create Stripe customer
  const stripeResult = await billingManager.createCustomer({
    id: userId,
    email,
    name,
  });

  if (!stripeResult.success) {
    await logger.error('Failed to create Stripe customer', {
      userId,
      error: stripeResult.error,
    });
    // Don't fail the webhook - we can retry Stripe customer creation later
  } else {
    await logger.info('Created Stripe customer', {
      userId,
      customerId: stripeResult.customerId,
    });
  }

  // 2. Create user in database with Stripe customer ID
  const userResult = await userManager.createUser({
    id: userId,
    email,
    name,
    stripeCustomerId: stripeResult.customerId,
    plan: 'free', // Default to free plan
  });

  if (!userResult.success) {
    await logger.error('Failed to create user in database', {
      userId,
      error: userResult.error,
    });
    throw new Error('Failed to create user in database');
  }

  await logger.info('Successfully created user', { userId });
}

// Handle user.updated event
async function handleUserUpdated(userId: string, email: string, name?: string) {
  await logger.info('Handling user.updated event', { userId, email });

  // Update user in database
  const result = await userManager.updateUser(userId, {
    email,
    name,
  });

  if (!result.success) {
    await logger.error('Failed to update user', {
      userId,
      error: result.error,
    });
    throw new Error('Failed to update user');
  }

  await logger.info('Successfully updated user', { userId });
}

// Handle user.deleted event
async function handleUserDeleted(userId: string) {
  await logger.info('Handling user.deleted event', { userId });

  // Get user to find Stripe customer ID
  const user = await userManager.getUser(userId);

  if (user && user.stripeCustomerId) {
    // Cancel any active subscriptions
    // Note: We don't delete the Stripe customer for record-keeping
    await logger.info('User has Stripe customer', {
      userId,
      customerId: user.stripeCustomerId,
    });
  }

  // Soft delete or mark user as deleted in database
  const result = await userManager.deleteUser(userId);

  if (!result.success) {
    await logger.error('Failed to delete user', {
      userId,
      error: result.error,
    });
    throw new Error('Failed to delete user');
  }

  await logger.info('Successfully deleted user', { userId });
}
