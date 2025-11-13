import { NextRequest, NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/db/pool';
import { emailService } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

const LeadCaptureSchema = z.object({
  dealerUrl: z.string().url('Valid dealer URL is required'),
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().default('landing_page'),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export const POST = createPublicRoute(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = LeadCaptureSchema.parse(body);
    const { dealerUrl, email, name, phone, company, source, utm_source, utm_medium, utm_campaign } = validated;

    // Extract IP and user agent for tracking
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const leadData: LeadData & { ipAddress: string; userAgent: string; timestamp: string } = {
      dealerUrl,
      email,
      name,
      phone,
      company,
      source: source || 'landing_page',
      utm_source,
      utm_medium,
      utm_campaign,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    // Save to database
    try {
      const supabase = getSupabaseClient();
      const { error: dbError } = await supabase.from('leads').insert({
        dealer_url: dealerUrl,
        email,
        name,
        phone,
        company,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error('Failed to save lead to database:', dbError);
      }
    } catch (dbError: any) {
      console.error('Database error:', dbError);
    }

    // Send to HubSpot
    try {
      await sendToHubSpot(leadData);
    } catch (hubspotError: any) {
      console.error('HubSpot error:', hubspotError);
    }

    // Send email notification
    if (email) {
      try {
        await emailService.sendWelcomeEmail(email, dealerName || company || dealerUrl);
      } catch (emailError: any) {
        console.error('Email error:', emailError);
      }
    }

    // Return success with lead ID
    const leadId = `lead_${Date.now()}`;

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Lead captured successfully',
      redirectUrl: `/dashboard?dealer=${encodeURIComponent(dealerUrl)}`,
    });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}, {
  schema: LeadCaptureSchema,
});

// HubSpot integration
async function sendToHubSpot(leadData: any) {
  const HUBSPOT_API_KEY = process.env.HUBSPOT_ACCESS_TOKEN;
  const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
  const HUBSPOT_FORM_GUID = process.env.HUBSPOT_FORM_GUID;

  if (!HUBSPOT_API_KEY || !HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_GUID) {
    console.warn('HubSpot credentials not configured');
    return;
  }

  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            {
              name: 'email',
              value: leadData.email || '',
            },
            {
              name: 'firstname',
              value: leadData.name || '',
            },
            {
              name: 'phone',
              value: leadData.phone || '',
            },
            {
              name: 'company',
              value: leadData.company || leadData.dealerUrl,
            },
            {
              name: 'website',
              value: leadData.dealerUrl,
            },
          ],
          context: {
            pageUri: 'https://www.dealershipai.com',
            pageName: 'Landing Page - Lead Capture',
          },
        }),
      }
    );

    if (response.ok) {
      console.log('Lead sent to HubSpot successfully');
    } else {
      console.error('HubSpot API error:', await response.text());
    }
  } catch (error) {
    console.error('Error sending to HubSpot:', error);
  }
}

// Email notification
async function sendLeadNotification(leadData: any) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@dealershipai.com';
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'leads@dealershipai.com';

  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured');
    return;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: NOTIFY_EMAIL }],
            subject: `New Lead: ${leadData.dealerUrl}`,
          },
        ],
        from: { email: FROM_EMAIL, name: 'DealershipAI' },
        content: [
          {
            type: 'text/html',
            value: `
              <h2>New Lead Captured</h2>
              <p><strong>Dealer URL:</strong> ${leadData.dealerUrl}</p>
              <p><strong>Email:</strong> ${leadData.email || 'Not provided'}</p>
              <p><strong>Name:</strong> ${leadData.name || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</p>
              <p><strong>Company:</strong> ${leadData.company || 'Not provided'}</p>
              <p><strong>Source:</strong> ${leadData.source}</p>
              <p><strong>UTM Source:</strong> ${leadData.utm_source || 'None'}</p>
              <p><strong>UTM Medium:</strong> ${leadData.utm_medium || 'None'}</p>
              <p><strong>UTM Campaign:</strong> ${leadData.utm_campaign || 'None'}</p>
              <p><strong>IP Address:</strong> ${leadData.ipAddress}</p>
              <p><strong>Timestamp:</strong> ${leadData.timestamp}</p>
            `,
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('Lead notification email sent successfully');
    } else {
      console.error('SendGrid API error:', await response.text());
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}
