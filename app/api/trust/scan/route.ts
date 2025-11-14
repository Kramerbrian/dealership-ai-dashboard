import { NextRequest, NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import {
  calculateAllMetrics,
  fetchSERPResults,
  type DealerData
} from '@/lib/trust/core-metrics';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// SendGrid removed - email functionality disabled
// Email sending can be re-enabled via Resend or another service if needed

const scanRequestSchema = z.object({
  businessName: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  email: z.string().email(),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, location, email } = scanRequestSchema.parse(body);

    // Construct dealer data
    const dealerData: DealerData = {
      name: businessName,
      website: '', // Would be fetched from database or external API
      address: location,
      lastContentUpdate: new Date(), // Mock data - would be fetched from scraping
      reviews: [
        // Mock review data - would be fetched from Google, Yelp, etc.
        {
          source: 'Google',
          rating: 4.5,
          count: 150,
          lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        },
      ],
      structuredData: {
        '@type': 'LocalBusiness',
        name: businessName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location,
        },
      },
    };

    // Fetch SERP results (currently returns mock data)
    const serpResults = await fetchSERPResults(businessName, location);

    // Calculate all trust metrics
    const metrics = await calculateAllMetrics(dealerData, serpResults);

    // Generate recommendations based on scores
    const recommendations: string[] = [];

    if (metrics.freshness_score < 0.7) {
      recommendations.push('Update your website content more frequently to improve freshness');
    }

    if (metrics.business_identity_match_score < 0.7) {
      recommendations.push('Ensure NAP (Name, Address, Phone) consistency across all platforms');
    }

    if (metrics.review_trust_score < 0.7) {
      recommendations.push('Actively request and respond to customer reviews');
    }

    if (metrics.schema_coverage < 0.7) {
      recommendations.push('Add structured data (Schema.org) to your website');
    }

    if (metrics.ai_mention_rate < 0.7) {
      recommendations.push('Optimize content for AI search engines with clear, factual information');
    }

    if (metrics.zero_click_coverage < 0.7) {
      recommendations.push('Create content that answers common customer questions directly');
    }

    const result = {
      ...metrics,
      recommendations,
    };

    // **CRITICAL: Persist lead to database**
    try {
      await prisma.trustScanLead.create({
        data: {
          businessName,
          location,
          email,
          trustScore: metrics.trust_score,
          freshnessScore: metrics.freshness_score,
          identityScore: metrics.business_identity_match_score,
          reviewScore: metrics.review_trust_score,
          schemaScore: metrics.schema_coverage,
          aiMentionScore: metrics.ai_mention_rate,
          zeroClickScore: metrics.zero_click_coverage,
          recommendations,
          source: 'FreeScanWidget',
          status: 'NEW',
          isQualified: metrics.trust_score < 0.7, // Auto-qualify if score is low (needs improvement)
          // UTM tracking would be extracted from query params in production
          utmSource: req.nextUrl.searchParams.get('utm_source') || undefined,
          utmMedium: req.nextUrl.searchParams.get('utm_medium') || undefined,
          utmCampaign: req.nextUrl.searchParams.get('utm_campaign') || undefined,
          referrer: req.headers.get('referer') || undefined,
        },
      });

      console.log('✅ Lead persisted to database:', {
        email,
        businessName,
        trustScore: metrics.trust_score,
      });
    } catch (dbError) {
      console.error('❌ Failed to persist lead to database:', dbError);
      // Continue even if database save fails - don't block user experience
    }

    // Email sending disabled - can be re-enabled with Resend or another service
    // The lead is still persisted to the database above

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Trust scan error:', error);
    return NextResponse.json(
      { error: 'Failed to complete trust scan' },
      { status: 500 }
    );
  }
}

function generateEmailHTML(
  businessName: string,
  metrics: any,
  recommendations: string[]
): string {
  const scoreColor = metrics.trust_score >= 0.8 ? '#10b981' :
                     metrics.trust_score >= 0.6 ? '#f59e0b' : '#ef4444';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Trust Score Results</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Your Trust Score Results</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">for ${businessName}</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 10px;">
            <div style="font-size: 64px; font-weight: bold; color: ${scoreColor}; margin-bottom: 10px;">
              ${Math.round(metrics.trust_score * 100)}
            </div>
            <div style="font-size: 18px; color: #6b7280;">Overall Trust Score</div>
          </div>

          <h2 style="color: #111827; margin-top: 30px; margin-bottom: 15px;">Score Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;">Freshness</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${Math.round(metrics.freshness_score * 100)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;">Identity Match</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${Math.round(metrics.business_identity_match_score * 100)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;">Review Trust</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${Math.round(metrics.review_trust_score * 100)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;">Schema Coverage</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${Math.round(metrics.schema_coverage * 100)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;">AI Mentions</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${Math.round(metrics.ai_mention_rate * 100)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">Zero-Click Coverage</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${Math.round(metrics.zero_click_coverage * 100)}</td>
            </tr>
          </table>

          <h2 style="color: #111827; margin-top: 30px; margin-bottom: 15px;">Top Recommendations</h2>
          <ul style="padding-left: 20px; color: #4b5563;">
            ${recommendations.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
          </ul>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/signup"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Improve Your Trust Score
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">Start your free trial today</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
          <p>© ${new Date().getFullYear()} DealershipAI. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export const POST = createPublicRoute(handler, {
  rateLimit: true,
  validateSchema: scanRequestSchema
});
