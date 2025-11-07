// app/api/schema/validate/route.ts

import { NextResponse } from "next/server";



type Issue = {

  id: string;

  type: "missing" | "invalid" | "warning";

  message: string;

  where?: string;

};



type SchemaAudit = {

  url: string;

  detectedTypes: string[];

  issues: Issue[];

  lastCheckedISO: string;

};



export async function GET(req: Request) {

  try {

    const urlIn = new URL(req.url);

    const domain = urlIn.searchParams.get("domain") || "";

    let pageUrl = urlIn.searchParams.get("url");

    if (!pageUrl && domain) pageUrl = `https://${domain}`;



    if (!pageUrl) {

      return NextResponse.json(

        { error: "Specify ?domain= or ?url=" },

        { status: 400 }

      );

    }



    const resp = await fetch(pageUrl, { headers: { "User-Agent": "DealershipAI/SchemaAuditor" }});

    if (!resp.ok) {

      return NextResponse.json(

        { error: `Fetch failed: ${resp.status}` },

        { status: 502 }

      );

    }

    const html = await resp.text();



    // Extract JSON-LD blocks (basic; replace with robust parser as needed)

    const jsonLdMatches = [...html.matchAll(

      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

    )].map(m => m[1].trim());



    const detectedTypes: string[] = [];

    const issues: Issue[] = [];



    if (jsonLdMatches.length === 0) {

      issues.push({

        id: "no_json_ld",

        type: "missing",

        message: "No JSON-LD detected on page."

      });

    }



    for (const block of jsonLdMatches) {

      try {

        const parsed = JSON.parse(block);

        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {

          if (item["@type"]) {

            const t = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];

            detectedTypes.push(...t);

          }

        }

      } catch {

        issues.push({

          id: "invalid_json_ld",

          type: "invalid",

          message: "Invalid JSON-LD (parse error).",

        });

      }

    }



    // Soft checks for core types

    const needTypes = ["Product", "FAQPage", "AutoDealer"];

    for (const t of needTypes) {

      if (!detectedTypes.includes(t)) {

        issues.push({

          id: `missing_${t.toLowerCase()}`,

          type: "missing",

          message: `Missing ${t} schema — recommended for AI citations.`,

        });

      }

    }



    // Example: look for obvious Product flaws (very naive)

    if (detectedTypes.includes("Product")) {

      const badOffers = html.includes('"@type":"Product"') && !html.includes('"offers"');

      if (badOffers) {

        issues.push({

          id: "product_missing_offers",

          type: "warning",

          message: "Product schema found without offers — add price/availability.",

        });

      }

    }



    const audit: SchemaAudit = {

      url: pageUrl,

      detectedTypes: Array.from(new Set(detectedTypes)),

      issues,

      lastCheckedISO: new Date().toISOString()

    };



    return NextResponse.json(audit, {

      headers: { "Cache-Control": "s-maxage=180, stale-while-revalidate=600" },

    });

  } catch (e: any) {

    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });

  }

}
