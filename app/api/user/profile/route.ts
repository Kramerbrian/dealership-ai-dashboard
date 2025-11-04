import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { userProfileUpdateSchema, validateRequestBody } from '@/lib/validation/schemas';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

/**
 * User Profile API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Input validation
 * - Rate limiting
 * - Performance monitoring
 */

export const GET = createApiRoute(
  {
    endpoint: '/api/user/profile',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      // Fetch user profile
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        include: {
          subscriptions: true
        }
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user
      });

    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/user/profile',
        userId: auth.userId,
      });
    }
  }
);

export const PUT = createApiRoute(
  {
    endpoint: '/api/user/profile',
    requireAuth: true,
    validateBody: userProfileUpdateSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, userProfileUpdateSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }

      const { firstName, lastName, email, preferences, company, phone, domain, role, plan } = bodyValidation.data;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: auth.userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email || undefined,
          // Store additional fields in metadata
          metadata: {
            ...(preferences || {}),
            ...(company && { company }),
            ...(phone && { phone }),
            ...(domain && { domain }),
            ...(role && { role }),
            ...(plan && { plan }),
          }
        }
      });

      // If user selected a paid plan, create a trial subscription
      if (plan && plan !== 'free') {
        await prisma.subscription.upsert({
          where: { userId: auth.userId },
          update: {
            plan: plan.toUpperCase(),
            status: 'TRIAL',
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          },
          create: {
            userId: auth.userId,
            plan: plan.toUpperCase(),
            status: 'TRIAL',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          }
        });
      }

      return noCacheResponse({
        success: true,
        user: updatedUser
      });

    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/user/profile',
        userId: auth.userId,
      });
    }
  }
);
