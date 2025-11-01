import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

/**
 * Send email via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'DealershipAI <noreply@mail.dealershipai.com>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
