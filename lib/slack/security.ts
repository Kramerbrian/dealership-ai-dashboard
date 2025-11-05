/**
 * Slack Security Hardening
 * 
 * Verifies Slack user identity against Clerk tenant before executing actions
 */

// Dynamic import to avoid build errors if @slack/web-api is not installed
let WebClient: any;
let slackClient: any;

async function initSlackClient() {
  if (!slackClient && process.env.SLACK_BOT_TOKEN) {
    try {
      WebClient = (await import("@slack/web-api")).WebClient;
      slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    } catch (error) {
      console.warn("@slack/web-api not installed, Slack features disabled");
    }
  }
  return slackClient;
}
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

/**
 * Get Slack user's email address
 */
export async function getSlackUserEmail(userId: string): Promise<string | null> {
  try {
    const client = await initSlackClient();
    if (!client) return null;
    const result = await client.users.info({ user: userId });
    return result.user?.profile?.email || null;
  } catch (error) {
    console.error("Failed to get Slack user email:", error);
    return null;
  }
}

/**
 * Verify Slack user exists in Clerk tenant
 */
export async function verifySlackUser(email: string): Promise<boolean> {
  if (!CLERK_SECRET_KEY) {
    console.warn("[Slack Security] CLERK_SECRET_KEY not configured, skipping verification");
    return true; // Allow in development
  }

  try {
    const res = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!res.ok) {
      console.error("Clerk API error:", res.status, res.statusText);
      return false;
    }

    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error("Failed to verify Slack user with Clerk:", error);
    return false;
  }
}

/**
 * Verify Slack user and get their email
 * Returns email if verified, null otherwise
 */
export async function verifyAndGetSlackUserEmail(
  userId: string
): Promise<string | null> {
  const email = await getSlackUserEmail(userId);
  if (!email) {
    return null;
  }

  const isVerified = await verifySlackUser(email);
  return isVerified ? email : null;
}

