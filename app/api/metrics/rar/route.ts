import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain") || "exampledealer.com";

  // Stubbed data — replace with upstream fetch to your core:
  const monthly = 42800;
  const annual = monthly * 12;
  const confidence = 0.86;
  const drivers = [
    { label: "Zero-Click gap", impact: 38 },
    { label: "Schema coverage loss", impact: 27 },
    { label: "Review response SLA", impact: 21 },
    { label: "Citation loss / NAP drift", impact: 14 }
  ];

  return NextResponse.json({
    domain,
    monthly,
    annual,
    confidence,
    drivers
  });
}
