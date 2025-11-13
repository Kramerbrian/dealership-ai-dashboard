import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Lazy initialization to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const leadSchema = z.object({
  email: z.string().email(),
  businessName: z.string().min(2),
  location: z.string().min(2),
  trustScore: z.number().optional(),
  source: z.string().default('freescan_widget'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const data = leadSchema.parse(body);

    // Check for existing lead
    const { data: existing } = await supabase
      .from('leads')
      .select('id, scans_completed')
      .eq('email', data.email)
      .eq('dealer', data.businessName)
      .single();

    if (existing) {
      // Update existing lead
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          scans_completed: (existing.scans_completed || 1) + 1,
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        leadId: existing.id, 
        isNew: false 
      });
    }

    // Create new lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        dealer: data.businessName,
        email: data.email,
        company_name: data.businessName,
        city: data.location,
        source: data.source,
        score: data.trustScore ? Math.round(data.trustScore * 100) : 0,
        status: 'new',
        scans_completed: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist or column names differ, try alternative schema
      console.error('Lead insert error:', error);
      
      // Fallback: try with different column names
      const { data: fallbackLead, error: fallbackError } = await supabase
        .from('leads')
        .insert({
          dealership_name: data.businessName,
          contact_name: data.businessName,
          email: data.email,
          city: data.location,
          source: data.source,
          status: 'new',
        })
        .select()
        .single();

      if (fallbackError) throw fallbackError;
      
      return NextResponse.json({ 
        success: true, 
        leadId: fallbackLead.id, 
        isNew: true 
      });
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id, 
      isNew: true 
    });
  } catch (error: any) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to capture lead' },
      { status: 400 }
    );
  }
}

