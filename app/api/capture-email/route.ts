import { NextRequest, NextResponse } from "next/server";
import { getSbAdmin } from "@/lib/supabase";
import { rateLimitMiddleware, RateLimits } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Apply rate limiting: 5 email captures per hour
  const rateLimitResponse = await rateLimitMiddleware(req, RateLimits.emailCapture);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { dealer, email, scanResults, utm } = body;

    // Validate input
    if (!dealer || !email) {
      return NextResponse.json(
        { ok: false, error: "Missing dealer or email" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log("[Email Capture]", { dealer, email, timestamp: new Date().toISOString() });

    // Upsert lead (update if exists, insert if new) - demo mode if Supabase not configured
    const supabase = getSbAdmin();
    if (!supabase) {
      return NextResponse.json({ ok: true, demo: true, message: "Email captured (demo mode)" });
    }
    
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .upsert(
        {
          dealer,
          email,
          source: "instant_analyzer",
          utm_source: utm?.source,
          utm_medium: utm?.medium,
          utm_campaign: utm?.campaign,
          report_unlocked: true,
          report_unlocked_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          scans_completed: 1, // Will be incremented on conflict
        },
        {
          onConflict: "email,dealer",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (leadError) {
      console.error("[Email Capture] Lead upsert error:", leadError);
      // Continue even if DB insert fails
    }

    // Store scan results if provided
    if (scanResults && lead) {
      const { error: scanError } = await supabase
        .from("scan_history")
        .insert({
          dealer,
          lead_id: lead.id,
          zero_click_score: scanResults.zeroClick,
          ai_visibility_score: scanResults.aiVisibility,
          schema_coverage_score: scanResults.schemaCoverage,
          revenue_at_risk_usd: scanResults.revenueAtRisk,
          chatgpt_score: scanResults.chatgptScore,
          claude_score: scanResults.claudeScore,
          perplexity_score: scanResults.perplexityScore,
          gemini_score: scanResults.geminiScore,
          full_results: scanResults,
          session_id: req.headers.get("x-session-id") || undefined,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
          user_agent: req.headers.get("user-agent") || undefined,
        });

      if (scanError) {
        console.error("[Email Capture] Scan history error:", scanError);
      }
    }

    // Trigger welcome email (async, don't wait)
    if (lead && lead.id) {
      import("@/lib/email")
        .then(({ sendWelcomeEmail }) =>
          sendWelcomeEmail(
            lead.id,
            dealer,
            email,
            scanResults
              ? {
                  zeroClick: scanResults.zeroClick,
                  aiVisibility: scanResults.aiVisibility,
                  revenueAtRisk: scanResults.revenueAtRisk,
                }
              : undefined
          )
        )
        .catch((err) => console.error("[Email] Failed to send welcome email:", err));
    }

    // TODO: Send to external CRM/Marketing automation
    // - HubSpot: POST to /contacts/v1/contact/createOrUpdate/email/{email}
    // - Salesforce: POST to /services/data/v57.0/sobjects/Lead
    // - ActiveCampaign: POST to /api/3/contacts

    // TODO: Notify sales team via Slack
    // POST to webhook URL with lead details

    return NextResponse.json({
      ok: true,
      leadId: lead?.id,
      message: "Email captured successfully",
    });
  } catch (error: any) {
    console.error("[Email Capture Error]", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
