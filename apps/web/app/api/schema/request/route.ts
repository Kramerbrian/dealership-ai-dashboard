import { NextRequest, NextResponse } from "next/server";
import { GenerateSchemaZ } from "@/lib/api/zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateSchemaZ.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { dealerId, domain, pageType, intent } = parsed.data;

    // TODO: forward to dAI Schema Engineer or internal generator
    // const out = await fetch(SCHEMA_ENGINE_URL, { method:"POST", body: JSON.stringify(parsed.data) }).then(r=>r.json());

    // Stub response
    const jsonld = JSON.stringify({
      "@context": "https://schema.org",
      "@type": ["AutoDealer", "Organization"],
      name: "Draft",
      url: domain,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        itemListElement: [
          {
            "@type": "Offer",
            price: 21999,
            itemOffered: { "@type": "Vehicle" },
          },
        ],
      },
    });

    return NextResponse.json({
      jsonld,
      confidence: 0.91,
      message: "draft_generated",
    });
  } catch (error: any) {
    console.error("Schema request error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to generate schema" },
      { status: 500 }
    );
  }
}

