import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { website, dealershipName, challenge, email, name } = body;

    // Validate required fields
    if (!website || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store lead in database
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        website,
        dealership_name: dealershipName,
        challenge,
        email,
        name,
        status: 'new',
        source: 'smart_form',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error storing lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to store lead' },
        { status: 500 }
      );
    }

    // Trigger audit report generation (async)
    // This would call your AI scanning service
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: lead.id,
        website,
        email,
        name,
      }),
    }).catch(err => console.error('Failed to trigger audit:', err));

    // Send confirmation email (async)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        name,
        type: 'audit_started',
        data: { website, dealershipName },
      }),
    }).catch(err => console.error('Failed to send email:', err));

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
