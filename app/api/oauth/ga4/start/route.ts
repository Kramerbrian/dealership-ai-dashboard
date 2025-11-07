import { NextResponse } from "next/server";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPE = [
  "https://www.googleapis.com/auth/analytics.readonly",
].join(" ");

export async function GET(req: Request) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: SCOPE,
      state: isolation.tenantId, // round-trip tenant
    });
    return NextResponse.redirect(`${AUTH_URL}?${params.toString()}`);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to start OAuth" },
      { status: 500 }
    );
  }
}
