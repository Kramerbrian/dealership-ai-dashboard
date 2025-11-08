import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain") || "exampledealer.com";

  const pillars = {
    experience: {
      score: 82, delta: +3,
      evidence: [
        { label: "Service bay photos (12)", url: `https://${domain}/service` },
        { label: "Staff profiles (3/8)", url: `https://${domain}/team` }
      ],
      opportunities: [
        { title: "Publish 3 customer success stories", impact: 4, effort: "medium",
          steps: ["Collect stories", "Draft content", "Publish to /reviews"] },
        { title: "Add 5 more staff profiles", impact: 2, effort: "low", steps: ["Photo + bio", "Author schema"] }
      ]
    },
    expertise: {
      score: 91, delta: +7,
      evidence: [
        { label: "Honda Master Certified", url: null },
        { label: "FAQ depth (18 q's)", url: `https://${domain}/faq` }
      ],
      opportunities: [
        { title: "Publish technical blog 'Common Civic Issues'", impact: 3, effort: "medium",
          steps: ["Outline", "Draft", "Publish", "Link internally"] }
      ]
    },
    authority: {
      score: 88, delta: 0,
      evidence: [
        { label: "Industry citations (12)", url: null },
        { label: "Awards displayed (5)", url: `https://${domain}/awards` }
      ],
      opportunities: [
        { title: "Request citation from Cars.com article", impact: 2, effort: "low", steps: ["Contact editor", "Provide anchor link"] }
      ]
    },
    trust: {
      score: 86, delta: -2,
      evidence: [
        { label: "HTTPS", url: `https://${domain}` },
        { label: "Privacy policy (2023)", url: `https://${domain}/privacy` }
      ],
      opportunities: [
        { title: "Update privacy policy (2025)", impact: 1, effort: "low",
          steps: ["Revise doc", "Publish", "Link in footer"] },
        { title: "Respond to 10 pending reviews", impact: 3, effort: "medium",
          steps: ["Queue responses", "Escalate negatives", "Confirm publish"] }
      ]
    }
  };

  return NextResponse.json({ domain, pillars, overall: 87 });
}
