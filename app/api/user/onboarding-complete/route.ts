import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getClerkPublicMetadata } from '@/lib/types/clerk';
import { updateUserMetadata } from '@/lib/clerk';
import { validateUrlClient } from '@/lib/utils/url-validation-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/user/onboarding-complete
 * Marks user onboarding as complete in Clerk metadata and saves form data
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { websiteUrl, googleBusinessProfile, googleAnalytics } = body;

    // Get existing metadata
    const existingMetadata = getClerkPublicMetadata(user);
    
    // Prepare updated metadata
    const updatedMetadata: Record<string, any> = {
      ...existingMetadata,
      onboarding_complete: true,
    };

    // Validate and save website URL if provided
    if (websiteUrl) {
      const validation = validateUrlClient(websiteUrl);
      if (validation.valid && validation.normalized) {
        const domain = validation.normalized.replace(/^https?:\/\//, '').replace(/\/$/, '');
        updatedMetadata.domain = domain;
        updatedMetadata.dealershipUrl = validation.normalized;
      }
    }

    // Save Google Business Profile if provided
    if (googleBusinessProfile) {
      updatedMetadata.googleBusinessProfile = googleBusinessProfile;
    }

    // Save Google Analytics preference
    if (googleAnalytics !== undefined) {
      updatedMetadata.googleAnalytics = googleAnalytics;
    }

    // Update Clerk metadata using backend API
    const success = await updateUserMetadata(user.id, updatedMetadata);
    
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Failed to update user metadata' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      ok: true,
      message: 'Onboarding status saved',
      metadata: updatedMetadata,
    });
  } catch (error: any) {
    console.error('Onboarding complete API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save onboarding status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/onboarding-complete
 * Check if user has completed onboarding
 */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { ok: false, completed: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const metadata = getClerkPublicMetadata(user);
    const completed = metadata.onboarding_complete === true;

    return NextResponse.json({
      ok: true,
      completed,
      metadata,
    });
  } catch (error: any) {
    console.error('Onboarding check API error:', error);
    return NextResponse.json(
      { ok: false, completed: false, error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}
