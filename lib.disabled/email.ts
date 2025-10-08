import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Lead {
  id: string;
  dealership_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  created_at: string;
}

/**
 * Send email notification when a new lead is captured
 */
export async function sendLeadNotification(lead: Lead) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DealershipAI <noreply@dealershipai.com>',
      to: process.env.LEAD_NOTIFICATION_EMAIL || 'admin@dealershipai.com',
      subject: `New Lead: ${lead.dealership_name}`,
      html: `
        <h2>New Lead Captured</h2>
        <p>A new dealership has shown interest in DealershipAI.</p>

        <h3>Dealership Details</h3>
        <ul>
          <li><strong>Dealership:</strong> ${lead.dealership_name}</li>
          <li><strong>Contact Name:</strong> ${lead.contact_name}</li>
          <li><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></li>
          ${lead.phone ? `<li><strong>Phone:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></li>` : ''}
          ${lead.website ? `<li><strong>Website:</strong> <a href="${lead.website}" target="_blank">${lead.website}</a></li>` : ''}
        </ul>

        <h3>Next Steps</h3>
        <ol>
          <li>Review lead details in <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads">Admin Dashboard</a></li>
          <li>Reach out within 24 hours for best conversion rates</li>
          <li>Schedule a demo call to showcase the platform</li>
        </ol>

        <p><small>Lead ID: ${lead.id}</small></p>
        <p><small>Submitted: ${new Date(lead.created_at).toLocaleString()}</small></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Lead notification sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending lead notification:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to the lead
 */
export async function sendLeadWelcomeEmail(lead: Lead) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DealershipAI <hello@dealershipai.com>',
      to: lead.email,
      subject: 'Welcome to DealershipAI - Let\'s Transform Your Dealership',
      html: `
        <h2>Hi ${lead.contact_name},</h2>

        <p>Thank you for your interest in DealershipAI! We're excited to help ${lead.dealership_name} leverage AI-powered insights to drive growth.</p>

        <h3>What Happens Next?</h3>
        <ol>
          <li><strong>Our team will review your information</strong> and reach out within 24 hours</li>
          <li><strong>We'll schedule a personalized demo</strong> tailored to your dealership's needs</li>
          <li><strong>Get instant insights</strong> with our AI-powered audit of your online presence</li>
        </ol>

        <h3>Why DealershipAI?</h3>
        <ul>
          <li>📊 <strong>Real-time Analytics:</strong> Track performance across all channels</li>
          <li>🤖 <strong>AI Recommendations:</strong> Get actionable insights to improve conversions</li>
          <li>🎯 <strong>Competitive Analysis:</strong> See how you stack up against local competitors</li>
          <li>💰 <strong>ROI Tracking:</strong> Measure the impact of every marketing dollar</li>
        </ul>

        <p>In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_APP_URL}">platform features</a> or reach out with any questions.</p>

        <p>Looking forward to speaking with you soon!</p>

        <p>Best regards,<br>
        The DealershipAI Team</p>

        <hr>
        <p><small>This email was sent because you requested information at dealershipai.com. If you didn't make this request, you can safely ignore this email.</small></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}
