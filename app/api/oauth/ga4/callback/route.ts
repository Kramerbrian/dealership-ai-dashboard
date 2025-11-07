import { NextResponse } from "next/server";
import { upsertIntegration } from "@/lib/integrations/store";

// exchange helper
async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }>;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateTenant = url.searchParams.get("state"); // tenantId
    if (!code || !stateTenant) {
      return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
    }

    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await upsertIntegration({
      tenantId: stateTenant,
      kind: "ga4",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt,
      // optionally store GA4 property for this tenant later
      metadata: { ga4_property_id: process.env.GA4_PROPERTY_ID || null }
    });

    // Redirect back to onboarding or settings
    const redirectUrl = new URL("/onboarding", url.origin);
    redirectUrl.searchParams.set("ga4", "connected");
    return NextResponse.redirect(redirectUrl.toString());
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "OAuth failed" }, { status: 500 });
  }
}
