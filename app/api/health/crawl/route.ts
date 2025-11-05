import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    errors: [
      { code: 404, url: "/used-inventory/2020-camry-le", frequency: 7, lastSeen: "2025-11-03", impact: "High" },
      { code: 502, url: "/service-specials", frequency: 2, lastSeen: "2025-11-02", impact: "Medium" }
    ]
  });
}

