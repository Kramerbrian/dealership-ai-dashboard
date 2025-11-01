/**
 * GBP NAP Validation API Endpoint
 *
 * POST /api/gbp/validate
 * Validates Name, Address, Phone consistency for a dealer location
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { GBPClient } from '@/lib/integrations/gbp-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ValidateRequest {
  dealerId: string;
  locationId?: string;
  expectedNAP?: {
    name?: string;
    address?: string;
    phone?: string;
  };
  crossPlatformCheck?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ValidateRequest = await req.json();
    const { dealerId, locationId, expectedNAP, crossPlatformCheck } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      );
    }

    // Get dealer from database
    const dealer = await prisma.dealership.findUnique({
      where: { id: dealerId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        gbpLocationId: true,
        userId: true
      }
    });

    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this dealer
    if (dealer.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Initialize GBP client
    const gbpClient = new GBPClient();
    const gbpLocationId = locationId || dealer.gbpLocationId;

    if (!gbpLocationId) {
      return NextResponse.json(
        { error: 'No GBP location ID associated with this dealer' },
        { status: 400 }
      );
    }

    // Prepare expected NAP from dealer data if not provided
    const napToValidate = expectedNAP || {
      name: dealer.name,
      address: `${dealer.address}, ${dealer.city}, ${dealer.state} ${dealer.zipCode}`,
      phone: dealer.phone || ''
    };

    let validation;
    let crossPlatformResult;

    if (crossPlatformCheck) {
      // Cross-platform validation
      const sources = [
        {
          platform: 'Website',
          name: dealer.name,
          address: napToValidate.address || '',
          phone: napToValidate.phone || ''
        }
        // TODO: Add more sources (Facebook, Yelp, etc.)
      ];

      crossPlatformResult = await gbpClient.crossPlatformNAPCheck(
        gbpLocationId,
        sources
      );

      validation = crossPlatformResult.gbpData;
    } else {
      // Standard validation
      validation = await gbpClient.validateNAP(gbpLocationId, napToValidate);
    }

    // Store validation result in database
    await prisma.dealership.update({
      where: { id: dealerId },
      data: {
        napValidation: validation as any,
        napConsistencyScore: validation.confidenceScore,
        lastNAPCheck: new Date()
      }
    });

    // Create audit log
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'nap_validation',
        eventData: {
          dealerId,
          isConsistent: validation.isConsistent,
          confidenceScore: validation.confidenceScore,
          issues: [
            ...validation.name.issues || [],
            ...validation.address.issues || [],
            ...validation.phone.issues || []
          ]
        },
        userId,
        timestamp: new Date()
      }
    });

    // Return results
    return NextResponse.json({
      success: true,
      validation,
      crossPlatformResult: crossPlatformCheck ? crossPlatformResult : undefined,
      dealer: {
        id: dealer.id,
        name: dealer.name,
        gbpLocationId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[GBP Validate API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to validate NAP',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gbp/validate?dealerId=xxx
 * Get last validation result for a dealer
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      );
    }

    const dealer = await prisma.dealership.findUnique({
      where: { id: dealerId },
      select: {
        id: true,
        name: true,
        napValidation: true,
        napConsistencyScore: true,
        lastNAPCheck: true,
        userId: true
      }
    });

    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      );
    }

    if (dealer.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      dealer: {
        id: dealer.id,
        name: dealer.name
      },
      validation: dealer.napValidation,
      consistencyScore: dealer.napConsistencyScore,
      lastChecked: dealer.lastNAPCheck,
      needsRecheck: dealer.lastNAPCheck ?
        (Date.now() - dealer.lastNAPCheck.getTime()) > 7 * 24 * 60 * 60 * 1000 : // 7 days
        true
    });

  } catch (error) {
    console.error('[GBP Validate API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
