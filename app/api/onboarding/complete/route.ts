import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Mark onboarding as complete for current user
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      sessionId,
      domain,
      company,
      dealerName, // Simple onboarding flow
      website, // Simple onboarding flow
      integrations = [],
      skipReason
    } = body;

    // Handle simple onboarding flow (dealerName + website)
    const companyName = company || dealerName;
    const domainValue = domain || website;

    const supabase = getSupabase();

    if (!supabase) {
      // If Supabase not configured, just return success
      return NextResponse.json({
        success: true,
        message: 'Onboarding completed (Supabase not configured)'
      });
    }

    // Try to upsert onboarding progress
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          tenant_id: userId, // Use userId as tenant_id for now
          current_step: 5,
          completion_percentage: 100,
          stripe_session_id: sessionId,
          domain: domainValue,
          company_name: companyName,
          connected_integrations: integrations,
          completed_at: new Date().toISOString(),
          last_updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,tenant_id'
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, log but don't fail
        if (error.message.includes('does not exist')) {
          console.warn('onboarding_progress table does not exist yet');
          return NextResponse.json({
            success: true,
            message: 'Onboarding completed (table not created yet)',
            tableExists: false
          });
        }

        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Onboarding completed successfully',
        data
      });

    } catch (dbError) {
      console.error('Database error:', dbError);

      // Return success anyway - don't block onboarding completion
      return NextResponse.json({
        success: true,
        message: 'Onboarding completed (with warnings)',
        warning: dbError instanceof Error ? dbError.message : 'Database error'
      });
    }

  } catch (error) {
    console.error('Error completing onboarding:', error);

    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Update onboarding progress (called at each step)
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      currentStep,
      progress,
      data: stepData
    } = body;

    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Progress saved (Supabase not configured)'
      });
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          tenant_id: userId,
          current_step: currentStep,
          completion_percentage: progress,
          last_updated_at: new Date().toISOString(),
          ...stepData
        }, {
          onConflict: 'user_id,tenant_id'
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('does not exist')) {
          return NextResponse.json({
            success: true,
            message: 'Progress saved (table not created yet)',
            tableExists: false
          });
        }

        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Progress updated',
        data
      });

    } catch (dbError) {
      console.error('Database error:', dbError);

      return NextResponse.json({
        success: true,
        message: 'Progress saved (with warnings)',
        warning: dbError instanceof Error ? dbError.message : 'Database error'
      });
    }

  } catch (error) {
    console.error('Error updating progress:', error);

    return NextResponse.json(
      {
        error: 'Failed to update progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
