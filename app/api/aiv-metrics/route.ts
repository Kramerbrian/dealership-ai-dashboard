import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AIVMetrics } from '@/types/aiv';

export async function GET(req: NextRequest) {
  try {
    const dealerId = req.nextUrl.searchParams.get('dealerId');
    
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning mock AIV metrics');
      
      // Return mock data for demo purposes
      const mockMetrics: AIVMetrics = {
        dealer_id: dealerId,
        aiv_score: 42,
        ati_score: 38,
        crs_score: 35,
        elasticity_usd_per_pt: 1250,
        r2_coefficient: 0.87,
        timestamp: new Date().toISOString(),
        metadata: {
          query_count: 1,
          confidence_score: 0.85,
          last_updated: new Date().toISOString(),
          recommendations: [
            'Improve local SEO presence',
            'Increase review response rate',
            'Optimize for voice search queries'
          ],
        },
      };

      // Generate mock trend data (last 12 weeks)
      const trends = Array.from({ length: 12 }, (_, i) => ({
        aiv_score: 42 + Math.sin(i * 0.5) * 5 + Math.random() * 3,
        ati_score: 38 + Math.cos(i * 0.3) * 4 + Math.random() * 2,
        crs_score: 35 + Math.sin(i * 0.7) * 3 + Math.random() * 2,
        elasticity_usd_per_pt: 1250 + Math.random() * 200 - 100,
        timestamp: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      return NextResponse.json({
        metrics: mockMetrics,
        trends,
        dealerId,
        userRole: 'demo',
        status: 'mock_data',
      });
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this dealer
    const { data: access, error: accessError } = await supabase
      .from('dealer_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('dealer_id', dealerId)
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Access denied to this dealer' },
        { status: 403 }
      );
    }

    // Get latest AIV metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('aiv_weekly')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (metricsError) {
      return NextResponse.json(
        { error: 'No AIV metrics found' },
        { status: 404 }
      );
    }

    // Get trend data (last 12 weeks)
    const { data: trends, error: trendsError } = await supabase
      .from('aiv_weekly')
      .select('aiv_score, ati_score, crs_score, elasticity_usd_per_pt, timestamp')
      .eq('dealer_id', dealerId)
      .order('timestamp', { ascending: true })
      .limit(12);

    if (trendsError) {
      console.error('Error fetching trends:', trendsError);
    }

    return NextResponse.json({
      metrics,
      trends: trends || [],
      dealerId,
      userRole: access.role,
      status: 'live_data',
    });

  } catch (error) {
    console.error('AIV Metrics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AIV metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, metrics } = body;

    if (!dealerId || !metrics) {
      return NextResponse.json(
        { error: 'Dealer ID and metrics are required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning mock response');
      return NextResponse.json({
        success: true,
        message: 'AIV metrics updated successfully (mock)',
        metrics: { ...metrics, dealer_id: dealerId },
      });
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this dealer
    const { data: access, error: accessError } = await supabase
      .from('dealer_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('dealer_id', dealerId)
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Access denied to this dealer' },
        { status: 403 }
      );
    }

    // Update AIV metrics
    const { data: result, error: upsertError } = await supabase
      .from('aiv_weekly')
      .upsert({
        dealer_id: dealerId,
        ...metrics,
        timestamp: new Date().toISOString(),
      }, {
        onConflict: 'dealer_id,timestamp',
      })
      .select()
      .single();

    if (upsertError) {
      throw upsertError;
    }

    // Log the update for audit purposes
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'aiv_metrics_updated',
        resource_type: 'aiv_metrics',
        resource_id: dealerId,
        changes: {
          previous_metrics: null, // Could fetch previous if needed
          new_metrics: metrics,
        },
        metadata: {
          update_method: 'api',
        },
      });

    return NextResponse.json({
      success: true,
      message: 'AIV metrics updated successfully',
      metrics: result,
    });

  } catch (error) {
    console.error('AIV Metrics Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update AIV metrics' },
      { status: 500 }
    );
  }
}
