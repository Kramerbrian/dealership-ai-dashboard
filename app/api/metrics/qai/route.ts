import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain") || "exampledealer.com";

  // Stubbed data:
  const value = 87;
  const delta = +3;
  const factors = [
    { key: "Experience", weight: 0.30, score: 82, note: "Good: service photos; missing customer stories" },
    { key: "Expertise",  weight: 0.25, score: 91, note: "Certifications present; add how-to posts" },
    { key: "Authority",  weight: 0.25, score: 88, note: "Citations stable; PR/press could improve" },
    { key: "Trust",      weight: 0.20, score: 86, note: "SLA improving; update privacy policy" }
  ];
  const evidence = [
    { type: "schema", label: "Organization / Person schema present", url: `https://${domain}/` },
    { type: "citation", label: "Industry citations: 12", url: null },
    { type: "review", label: "Review response rate: 65%", url: null }
  ];

  return NextResponse.json({ domain, value, delta, factors, evidence });
}
