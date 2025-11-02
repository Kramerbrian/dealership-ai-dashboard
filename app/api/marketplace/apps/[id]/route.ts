/**
 * Individual App Management
 * 
 * GET - Get app details
 * PUT - Update app
 * DELETE - Delete app (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const app = await prisma.marketplaceApp.findUnique({
      where: { id: params.id },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        installs_list: {
          include: {
            dealership: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true
              }
            }
          },
          take: 10
        },
        reviews_list: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        revenues: {
          orderBy: {
            year: 'desc',
            month: 'desc'
          },
          take: 12
        },
        _count: {
          select: {
            installs_list: true,
            reviews_list: true
          }
        }
      }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Don't expose API secret
    const { apiSecret, ...safeApp } = app;

    return NextResponse.json({ app: safeApp });
  } catch (error) {
    console.error('[Marketplace] Get app error:', error);
    return NextResponse.json(
      { error: 'Failed to get app' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, category, pricing, price, status } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (pricing) updateData.pricing = pricing;
    if (price !== undefined) updateData.price = price ? String(price) : null;
    if (status) {
      updateData.status = status;
      if (status === 'PENDING') {
        updateData.submittedAt = new Date();
      }
    }

    const app = await prisma.marketplaceApp.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ app });
  } catch (error: any) {
    console.error('[Marketplace] Update app error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update app' },
      { status: 500 }
    );
  }
}

