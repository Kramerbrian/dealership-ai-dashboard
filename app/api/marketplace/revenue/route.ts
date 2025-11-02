/**
 * Revenue Tracking API
 * 
 * GET - Get revenue history for developer
 * POST - Record new revenue (internal, called by payment system)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get revenue for developer or app
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');
    const developerId = searchParams.get('developerId');

    if (!appId && !developerId) {
      return NextResponse.json(
        { error: 'appId or developerId is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (appId) {
      where.appId = appId;
    } else if (developerId) {
      // Get all apps for developer
      const apps = await prisma.marketplaceApp.findMany({
        where: { developerId },
        select: { id: true }
      });
      where.appId = { in: apps.map(a => a.id) };
    }

    const revenues = await prisma.marketplaceRevenue.findMany({
      where,
      include: {
        app: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    // Calculate totals
    const totals = revenues.reduce((acc, rev) => {
      acc.gross += parseFloat(rev.grossRevenue);
      acc.platform += parseFloat(rev.platformFee);
      acc.developer += parseFloat(rev.developerShare);
      return acc;
    }, { gross: 0, platform: 0, developer: 0 });

    return NextResponse.json({
      revenues,
      totals
    });
  } catch (error) {
    console.error('[Marketplace] Get revenue error:', error);
    return NextResponse.json(
      { error: 'Failed to get revenue data' },
      { status: 500 }
    );
  }
}

// POST - Record revenue (called internally by payment processing)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appId, period, grossRevenue } = body;

    if (!appId || !period || !grossRevenue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse period (format: "2024-01")
    const [year, month] = period.split('-').map(Number);

    // Calculate splits (70/30)
    const gross = parseFloat(String(grossRevenue));
    const platformFee = (gross * 0.3).toFixed(2);
    const developerShare = (gross * 0.7).toFixed(2);

    const revenue = await prisma.marketplaceRevenue.upsert({
      where: {
        appId_year_month: {
          appId,
          year,
          month
        }
      },
      create: {
        appId,
        period,
        year,
        month,
        grossRevenue: String(gross),
        platformFee,
        developerShare,
        paid: false
      },
      update: {
        grossRevenue: String(gross),
        platformFee,
        developerShare
      }
    });

    return NextResponse.json({ revenue }, { status: 201 });
  } catch (error: any) {
    console.error('[Marketplace] Record revenue error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record revenue' },
      { status: 500 }
    );
  }
}

