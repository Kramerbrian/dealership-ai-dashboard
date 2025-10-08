import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendLeadNotification, sendLeadWelcomeEmail } from '@/lib/email';

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LeadSubmission {
  dealershipName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as LeadSubmission;

    // Validate required fields
    if (!body.dealershipName || !body.contactName || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields: dealershipName, contactName, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Extract metadata
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.ip || null;

    // Insert lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        dealership_name: body.dealershipName,
        contact_name: body.contactName,
        email: body.email,
        phone: body.phone || null,
        website: body.website || null,
        source: 'smartform',
        user_agent: userAgent,
        ip_address: ipAddress,
        referrer: referrer,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);

      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A lead with this email already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to save lead. Please try again.' },
        { status: 500 }
      );
    }

    // Send email notifications (non-blocking)
    Promise.all([
      sendLeadNotification(data),
      sendLeadWelcomeEmail(data)
    ]).catch(error => {
      console.error('Error sending email notifications:', error);
      // Don't fail the request if emails fail
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lead submitted successfully',
        leadId: data.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing lead submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leads (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: data,
      count: data.length
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
