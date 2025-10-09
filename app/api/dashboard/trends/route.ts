import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId');
  const days = parseInt(req.nextUrl.searchParams.get('days') || '180');
  
  if (!dealerId) {
    return NextResponse.json({ error: 'Dealer ID required' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Verify user has access to this dealer
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: access } = await supabase
    .from('dealer_access')
    .select('role')
    .eq('user_id', user.id)
    .eq('dealer_id', dealerId)
    .single();

  if (!access) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch trend data
  const { data: trends, error } = await supabase
    .from('dealer_metrics_history')
    .select(`
      date,
      visibility_score,
      mentions,
      revenue
    `)
    .eq('dealer_id', dealerId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('Failed to fetch trends:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }

  return NextResponse.json({ 
    data: trends || [], 
    dealerId, 
    days,
    userRole: access.role 
  });
}
