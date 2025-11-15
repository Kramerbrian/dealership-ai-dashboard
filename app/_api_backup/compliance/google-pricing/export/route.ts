import { NextRequest, NextResponse } from 'next/server';

// Mock Supabase client for demo purposes
const createMockSupabaseClient = () => ({
  from: (table: string) => ({
    select: (columns: string) => ({
      gte: (column: string, value: string) => ({
        order: (column: string, options: any) => ({
          eq: (column: string, value: string) => Promise.resolve({
            data: [],
            error: null
          })
        })
      })
    })
  })
});

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : createMockSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    const days = parseInt(searchParams.get('days') || '30');
    
    // Build query
    let query = supabase
      .from('google_policy_audits')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data: audits, error } = await query;
    
    if (error) {
      console.error('Error fetching audit data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit data' },
        { status: 500 }
      );
    }
    
    // Generate CSV content
    const csvHeaders = [
      'Date',
      'Tenant ID',
      'Ad URL',
      'LP URL',
      'VDP URL',
      'Compliant',
      'Risk Score',
      'Jaccard Score',
      'Price Mismatch',
      'Hidden Fees',
      'Disclosure Clarity',
      'Consistency Penalty',
      'Precision Penalty',
      'Critical Violations',
      'Warning Violations',
      'Violations Details'
    ];
    
    const csvRows = audits?.map((audit: any) => [
      new Date(audit.created_at).toISOString().split('T')[0],
      audit.tenant_id || '',
      audit.ad_url || '',
      audit.lp_url || '',
      audit.vdp_url || '',
      audit.compliant ? 'Yes' : 'No',
      audit.risk_score?.toString() || '0',
      audit.jaccard_score?.toString() || '0',
      audit.price_mismatch ? 'Yes' : 'No',
      audit.hidden_fees ? 'Yes' : 'No',
      audit.disclosure_clarity?.toString() || '0',
      audit.consistency_penalty?.toString() || '0',
      audit.precision_penalty?.toString() || '0',
      audit.violations?.filter((v: any) => v.type === 'critical').length || 0,
      audit.violations?.filter((v: any) => v.type === 'warning').length || 0,
      JSON.stringify(audit.violations || [])
    ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any) =>
        row.map((cell: any) =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        ).join(',')
      )
    ].join('\n');
    
    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="google-policy-compliance-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}
