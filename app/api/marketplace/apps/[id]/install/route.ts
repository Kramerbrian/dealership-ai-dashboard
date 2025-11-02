/**
 * App Installation API
 * 
 * POST - Install app for a dealership
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { dealershipId } = body;

    if (!dealershipId) {
      return NextResponse.json(
        { error: 'dealershipId is required' },
        { status: 400 }
      );
    }

    // Check if app exists and is LIVE
    const app = await prisma.marketplaceApp.findUnique({
      where: { id: params.id }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    if (app.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'App is not available for installation' },
        { status: 400 }
      );
    }

    // Check if already installed
    const existing = await prisma.marketplaceAppInstall.findUnique({
      where: {
        appId_dealershipId: {
          appId: params.id,
          dealershipId
        }
      }
    });

    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { error: 'App is already installed' },
        { status: 400 }
      );
    }

    // Create or update install
    const install = await prisma.marketplaceAppInstall.upsert({
      where: {
        appId_dealershipId: {
          appId: params.id,
          dealershipId
        }
      },
      create: {
        appId: params.id,
        dealershipId,
        status: 'active'
      },
      update: {
        status: 'active',
        installedAt: new Date(),
        uninstalledAt: null
      }
    });

    // Increment install count
    await prisma.marketplaceApp.update({
      where: { id: params.id },
      data: {
        installs: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ install }, { status: 201 });
  } catch (error: any) {
    console.error('[Marketplace] Install app error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to install app' },
      { status: 500 }
    );
  }
}

