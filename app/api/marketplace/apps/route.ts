/**
 * Marketplace Apps API
 * 
 * Handles:
 * - Listing apps (public)
 * - Creating new apps (developer)
 * - Updating apps (developer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// GET /api/marketplace/apps - List all apps (public or filtered by developer)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const developerId = searchParams.get('developerId');
    const status = searchParams.get('status') || 'LIVE';

    const where: any = {};
    if (developerId) {
      where.developerId = developerId;
    }
    if (status) {
      where.status = status;
    }

    const apps = await prisma.marketplaceApp.findMany({
      where,
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            installs_list: true,
            reviews_list: true
          }
        }
      },
      orderBy: {
        installs: 'desc'
      }
    });

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('[Marketplace] List apps error:', error);
    return NextResponse.json(
      { error: 'Failed to list apps' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/apps - Create new app
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category, pricing, price, developerId } = body;

    if (!name || !description || !developerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Generate API keys
    const apiKey = `mkp_${crypto.randomBytes(16).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');

    const app = await prisma.marketplaceApp.create({
      data: {
        name,
        slug,
        description,
        category: category || 'integration',
        pricing: pricing || 'FREE',
        price: price ? String(price) : null,
        developerId,
        apiKey,
        apiSecret,
        status: 'DRAFT',
        tags: JSON.stringify([])
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ app }, { status: 201 });
  } catch (error: any) {
    console.error('[Marketplace] Create app error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create app' },
      { status: 500 }
    );
  }
}

