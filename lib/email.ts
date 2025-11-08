/**
 * Email Service using Resend
 * Handles welcome emails, nurture sequences, and transactional emails
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@dealershipai.com";
const DASHBOARD_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  leadId?: string;
  templateId?: string;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Email] Resend API error:", data);

      // Log failed send
      if (options.leadId) {
        await supabase.from("email_sends").insert({
          lead_id: options.leadId,
          template_id: options.templateId,
          to_email: options.to,
          subject: options.subject,
          status: "failed",
          error_message: data.message || "Unknown error",
          provider: "resend",
        });
      }

      return { success: false, error: data.message };
    }

    // Log successful send
    if (options.leadId) {
      await supabase.from("email_sends").insert({
        lead_id: options.leadId,
        template_id: options.templateId,
        to_email: options.to,
        subject: options.subject,
        status: "sent",
        provider: "resend",
        provider_message_id: data.id,
        sent_at: new Date().toISOString(),
      });
    }

    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error("[Email] Send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Interpolate template variables
 */
function interpolateTemplate(template: string, variables: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value || ""));
  }
  return result;
}

/**
 * Send welcome email to new lead
 */
export async function sendWelcomeEmail(
  leadId: string,
  dealer: string,
  email: string,
  scanResults?: {
    zeroClick: number;
    aiVisibility: number;
    revenueAtRisk: number;
  }
): Promise<boolean> {
  try {
    // Get template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", "welcome")
      .eq("active", true)
      .single();

    if (!template) {
      console.warn("[Email] Welcome template not found");
      return false;
    }

    // Prepare variables
    const variables = {
      dealer,
      zero_click: scanResults?.zeroClick || 0,
      ai_visibility: scanResults?.aiVisibility || 0,
      revenue_at_risk: scanResults?.revenueAtRisk?.toLocaleString() || "0",
      dashboard_url: `${DASHBOARD_URL}/dash?dealer=${encodeURIComponent(dealer)}`,
    };

    // Interpolate template
    const html = interpolateTemplate(template.html_body, variables);
    const text = interpolateTemplate(template.text_body, variables);
    const subject = interpolateTemplate(template.subject, variables);

    // Send email
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
      leadId,
      templateId: template.id,
    });

    if (result.success) {
      // Mark welcome email as sent
      await supabase
        .from("leads")
        .update({
          welcome_email_sent: true,
          welcome_email_sent_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      console.log("[Email] Welcome email sent:", { leadId, email });
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Email] Welcome email error:", error);
    return false;
  }
}

/**
 * Send nurture email based on stage
 */
export async function sendNurtureEmail(
  leadId: string,
  stage: number
): Promise<boolean> {
  try {
    // Get lead details
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (!lead || lead.nurture_opt_out) {
      return false;
    }

    // Map stage to template name
    const templateNames: Record<number, string> = {
      1: "nurture_day1",
      2: "nurture_day3",
      3: "nurture_day7",
    };

    const templateName = templateNames[stage];
    if (!templateName) {
      console.warn("[Email] Invalid nurture stage:", stage);
      return false;
    }

    // Get template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", templateName)
      .eq("active", true)
      .single();

    if (!template) {
      console.warn(`[Email] Nurture template ${templateName} not found`);
      return false;
    }

    // Prepare variables
    const variables = {
      dealer: lead.dealer,
      ai_visibility: 84, // TODO: Get from scan_history
      market_avg: 92,
      revenue_gap: 15000,
      dashboard_url: `${DASHBOARD_URL}/dash?dealer=${encodeURIComponent(lead.dealer)}`,
      signup_url: `${DASHBOARD_URL}/sign-up?ref=nurture&dealer=${encodeURIComponent(lead.dealer)}`,
    };

    // Interpolate template
    const html = interpolateTemplate(template.html_body, variables);
    const text = interpolateTemplate(template.text_body, variables);
    const subject = interpolateTemplate(template.subject, variables);

    // Send email
    const result = await sendEmail({
      to: lead.email,
      subject,
      html,
      text,
      leadId: lead.id,
      templateId: template.id,
    });

    if (result.success) {
      // Update nurture stage
      await supabase
        .from("leads")
        .update({
          nurture_sequence_stage: stage,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      console.log("[Email] Nurture email sent:", { leadId, stage, email: lead.email });
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Email] Nurture email error:", error);
    return false;
  }
}

/**
 * Process nurture batch (call from cron)
 */
export async function processNurtureBatch(
  stage: number = 0,
  batchSize: number = 100
): Promise<{ sent: number; failed: number }> {
  try {
    // Get batch using SQL function
    const { data: batch } = await supabase.rpc("get_nurture_batch", {
      p_stage: stage,
      p_batch_size: batchSize,
    });

    if (!batch || batch.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Process each lead
    for (const lead of batch) {
      if (stage === 0) {
        // Welcome email
        const success = await sendWelcomeEmail(lead.id, lead.dealer, lead.email);
        success ? sent++ : failed++;
      } else {
        // Nurture email
        const success = await sendNurtureEmail(lead.id, stage);
        success ? sent++ : failed++;
      }

      // Rate limit: wait 100ms between sends
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[Email] Processed nurture batch stage ${stage}:`, { sent, failed });
    return { sent, failed };
  } catch (error) {
    console.error("[Email] Nurture batch error:", error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Opt out from nurture sequence
 */
export async function optOutFromNurture(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("leads")
      .update({ nurture_opt_out: true })
      .eq("email", email);

    return !error;
  } catch (error) {
    console.error("[Email] Opt-out error:", error);
    return false;
  }
}
