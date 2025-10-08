import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, name, type, data } = await request.json();

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get email template based on type
    const emailContent = getEmailTemplate(type, { name, ...data });

    // Send email using your email service (SendGrid, Resend, etc.)
    // For now, this is a stub - integrate with your preferred email service

    // Example using Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'DealershipAI <noreply@dealershipai.com>',
    //   to,
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    // });

    console.log('Email would be sent:', {
      to,
      subject: emailContent.subject,
      type,
    });

    return NextResponse.json({
      success: true,
      message: 'Email queued for delivery',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function getEmailTemplate(type: string, data: any) {
  switch (type) {
    case 'audit_started':
      return {
        subject: 'Your AI Visibility Audit is Being Generated',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hi ${data.name}! 👋</h2>
              <p>Thanks for requesting your AI visibility audit for <strong>${data.website}</strong>.</p>
              <p>Our AI is analyzing your dealership's presence across:</p>
              <ul>
                <li>Google AI Overviews</li>
                <li>ChatGPT</li>
                <li>Perplexity</li>
                <li>Claude</li>
                <li>Review platforms</li>
              </ul>
              <p>You'll receive your complete report in the next 2-5 minutes.</p>
              <p style="color: #666; font-size: 14px;">
                Stay tuned!<br>
                The DealershipAI Team
              </p>
            </body>
          </html>
        `,
      };

    case 'audit_complete':
      return {
        subject: '🎉 Your AI Visibility Audit is Ready!',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hi ${data.name}! 🎉</h2>
              <p>Your AI visibility audit for <strong>${data.website}</strong> is complete!</p>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Quick Summary:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0;">
                  ${data.summary?.overallScore || 'N/A'}% Overall Score
                </p>
                <p>AI Visibility: ${data.summary?.aiVisibility || 'N/A'}%</p>
                <p>Estimated Revenue at Risk: $${((data.summary?.revenueAtRisk || 0) / 1000).toFixed(0)}K/month</p>
              </div>

              <a href="${data.reportUrl}"
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                View Full Report →
              </a>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Questions? Reply to this email anytime.<br>
                The DealershipAI Team
              </p>
            </body>
          </html>
        `,
      };

    default:
      return {
        subject: 'DealershipAI Notification',
        html: '<p>You have a notification from DealershipAI.</p>',
      };
  }
}
