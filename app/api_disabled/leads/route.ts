import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const LeadSchema = z.object({
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().optional(),
  source: z.string().default('marketing_page'),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leadData = LeadSchema.parse(body);

    // Check if lead already exists
    const existingLead = await (prisma as any).lead.findUnique({
      where: { email: leadData.email }
    });

    if (existingLead) {
      return NextResponse.json({
        success: true,
        message: 'Lead already exists',
        leadId: existingLead.id
      });
    }

    // Create new lead
    const lead = await (prisma as any).lead.create({
      data: {
        email: leadData.email,
        company: leadData.company,
        phone: leadData.phone,
        source: leadData.source,
        utmSource: leadData.utm_source,
        utmMedium: leadData.utm_medium,
        utmCampaign: leadData.utm_campaign,
        status: 'new',
        ipAddress: (req as any).ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      }
    });

    // Send welcome email (in production, integrate with your email service)
    await sendWelcomeEmail(leadData.email, leadData.company);

    // Add to CRM (in production, integrate with HubSpot, Salesforce, etc.)
    await addToCRM(lead);

    // Track conversion (in production, integrate with Google Analytics, etc.)
    await trackConversion(lead);

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: lead.id
    });

  } catch (error) {
    console.error('Lead capture error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid lead data',
        details: (error as any).errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to capture lead'
    }, { status: 500 });
  }
}

async function sendWelcomeEmail(email: string, company: string) {
  try {
    // In production, integrate with SendGrid, Mailgun, etc.
    console.log(`Sending welcome email to ${email} for ${company}`);
    
    // Example SendGrid integration:
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@dealershipai.com',
    //   subject: 'Welcome to DealershipAI!',
    //   html: generateWelcomeEmailHTML(company)
    // });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

async function addToCRM(lead: any) {
  try {
    // In production, integrate with HubSpot, Salesforce, etc.
    console.log(`Adding lead to CRM: ${lead.email}`);
    
    // Example HubSpot integration:
    // await hubspot.contacts.create({
    //   properties: {
    //     email: lead.email,
    //     company: lead.company,
    //     phone: lead.phone,
    //     lead_source: lead.source
    //   }
    // });
  } catch (error) {
    console.error('Failed to add lead to CRM:', error);
  }
}

async function trackConversion(lead: any) {
  try {
    // In production, integrate with Google Analytics, Facebook Pixel, etc.
    console.log(`Tracking conversion for lead: ${lead.email}`);
    
    // Example Google Analytics integration:
    // gtag('event', 'lead_capture', {
    //   event_category: 'marketing',
    //   event_label: lead.source,
    //   value: 1
    // });
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
}

function generateWelcomeEmailHTML(company: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to DealershipAI</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Welcome to DealershipAI!</h1>
        
        <p>Hi ${company} team,</p>
        
        <p>Thank you for your interest in DealershipAI! We're excited to help you fight back against AI Overview traffic siphon.</p>
        
        <h2>What's Next?</h2>
        <ul>
          <li>Our team will review your information and reach out within 24 hours</li>
          <li>We'll schedule a personalized demo of our platform</li>
          <li>You'll get access to our free trial to see the results for yourself</li>
        </ul>
        
        <h2>In the Meantime</h2>
        <p>Check out our dashboard to see how we're helping dealerships like yours:</p>
        <a href="https://dealershipai.com/intelligence" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Dashboard
        </a>
        
        <p>Best regards,<br>The DealershipAI Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          DealershipAI - Fighting back against AI Overview traffic siphon<br>
          <a href="https://dealershipai.com">dealershipai.com</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
