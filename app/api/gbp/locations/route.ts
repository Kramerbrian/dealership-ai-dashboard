/**
 * GBP Locations API Endpoint
 *
 * GET /api/gbp/locations
 * List all GBP locations for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { GBPClient } from '@/lib/integrations/gbp-client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const gbpClient = new GBPClient();
    const locations = await gbpClient.listLocations();

    // Get existing dealers to match with GBP locations
    const dealers = await prisma.dealership.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        gbpLocationId: true
      }
    });

    // Match locations with dealers
    const locationsWithMatch = locations.map(loc => {
      const matchedDealer = dealers.find(d => d.gbpLocationId === loc.locationId);

      return {
        ...loc,
        isLinked: !!matchedDealer,
        linkedDealerId: matchedDealer?.id,
        linkedDealerName: matchedDealer?.name
      };
    });

    return NextResponse.json({
      success: true,
      locations: locationsWithMatch,
      total: locations.length,
      linked: locationsWithMatch.filter(l => l.isLinked).length,
      unlinked: locationsWithMatch.filter(l => !l.isLinked).length
    });

  } catch (error) {
    console.error('[GBP Locations API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch locations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gbp/locations
 * Link a GBP location to a dealer
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { dealerId, locationId } = await req.json();

    if (!dealerId || !locationId) {
      return NextResponse.json(
        { error: 'dealerId and locationId are required' },
        { status: 400 }
      );
    }

    // Verify dealer belongs to user
    const dealer = await prisma.dealership.findUnique({
      where: { id: dealerId }
    });

    if (!dealer || dealer.userId !== userId) {
      return NextResponse.json(
        { error: 'Dealer not found or access denied' },
        { status: 403 }
      );
    }

    // Update dealer with GBP location ID
    const updated = await prisma.dealership.update({
      where: { id: dealerId },
      data: {
        gbpLocationId: locationId
      }
    });

    return NextResponse.json({
      success: true,
      dealer: {
        id: updated.id,
        name: updated.name,
        gbpLocationId: updated.gbpLocationId
      }
    });

  } catch (error) {
    console.error('[GBP Locations API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to link location',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
