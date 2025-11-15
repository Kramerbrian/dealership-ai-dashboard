/**
 * AI Score Computation API
 * Computes SEO, AEO, GEO, QAI, Trust Score, and financials in one shot
 * 
 * NOTE: This endpoint uses lib/score/formulas (technical SEO scoring system)
 * which is different from lib/scoring.ts (AI visibility scoring system).
 * 
 * - lib/score/formulas: Technical metrics (CWV, crawl index, content quality)
 * - lib/scoring.ts: AI visibility metrics (mentions, citations, sentiment)
 * 
 * Both systems serve different purposes and are maintained separately.
 */

import { NextResponse } from "next/server";
import { SEOZ, AEOZ, GEOZ, QAIZ, EEATZ, FinancialZ } from "@/lib/score/schemas";
import {
  seoScore,
  aeoScore,
  geoScore,
  qaiScore,
  trustScore,
  ociMonthly,
  aiaAttribution,
  decayTax,
} from "@/lib/score/formulas";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const seoIn = SEOZ.parse(body.seo);
    const aeoIn = AEOZ.parse(body.aeo);
    const geoIn = GEOZ.parse(body.geo);
    const qaiIn = QAIZ.parse(body.qai);
    const eeatIn = EEATZ.parse(body.eeat);
    const finIn = body.financial ? FinancialZ.parse(body.financial) : null;

    // Compute scores
    const SEO = seoScore(seoIn);
    const AEO = aeoScore(aeoIn);
    const GEO = geoScore(geoIn);
    const QAI = qaiScore(SEO, AEO, GEO, qaiIn);
    const TRUST = trustScore(QAI, eeatIn);

    // Compute financials if provided
    const financials = finIn
      ? {
          OCI: Math.round(ociMonthly(finIn)),
          AIA: +aiaAttribution(finIn).toFixed(3),
          DecayTax: Math.round(decayTax(finIn)),
        }
      : null;

    return NextResponse.json(
      {
        SEO: +SEO.toFixed(4),
        AEO: +AEO.toFixed(4),
        GEO: +GEO.toFixed(4),
        QAI: +QAI.toFixed(4),
        TrustScore: TRUST,
        financials,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid input", details: error.message },
      { status: 400 }
    );
  }
}

