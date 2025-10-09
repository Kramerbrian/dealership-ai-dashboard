import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId');
  
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

  // Fetch competitor data
  const { data: competitors, error } = await supabase
    .from('dealer_competitors')
    .select(`
      competitor_name,
      ai_visibility,
      monthly_leads,
      avg_price,
      trend,
      updated_at
    `)
    .eq('dealer_id', dealerId)
    .order('ai_visibility', { ascending: false });

  if (error) {
    console.error('Failed to fetch competitors:', error);
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 });
  }

  return NextResponse.json({ 
    data: competitors || [], 
    dealerId, 
    userRole: access.role 
  });
}
