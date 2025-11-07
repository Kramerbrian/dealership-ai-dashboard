// app/api/competitors/route.ts

import { NextResponse } from "next/server";

import dealerSeg from "@/configs/dealer_segment_table.json";



// --- Types ---

type Dealer = {

  id: string;

  name: string;

  oem_brand: string;

  lat: number;

  lng: number;

  medianPrice?: number;

  inventorySample?: string[]; // model names/keywords to infer body style

};



type ScoredDealer = Dealer & { segment?: string; oem_region?: string; score: number; distanceMiles: number };



// --- Helpers ---

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {

  const R = 3958.8;

  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);

  const dLon = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);

  const lat2 = toRad(b.lat);

  const s =

    Math.sin(dLat / 2) ** 2 +

    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));

}



function mapBrandToSegment(brand: string) {

  const t: any = dealerSeg;

  for (const row of t.brand_segments || []) {

    if ((row.brands || []).map((x: string) => x.toLowerCase()).includes((brand || "").toLowerCase())) {

      return { segment: row.segment, oem_region: row.oem_region };

  }}

  return { segment: t.fallbacks?.if_brand_unknown || "import_mainstream", oem_region: "Mixed" };

}



function inferBodyStyleFocus(sample: string[] = []) {

  // quick keyword match → {truck|suv|sedan|compact_sedan|performance|ev}

  const keys: Record<string, string[]> = (dealerSeg as any).body_style_keywords || {};

  const counts: Record<string, number> = {};

  for (const [style, words] of Object.entries(keys)) {

    counts[style] = sample.reduce((acc, s) => {

      const inStr = s.toLowerCase();

      return acc + (words.some((w) => inStr.includes((w as string).toLowerCase())) ? 1 : 0);

    }, 0);

  }

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "suv";

  return winner;

}



function priceBand(v?: number) {

  if (!v && v !== 0) return "mid";

  const bands: any[] = (dealerSeg as any).defaults?.price_bands || [];

  for (const b of bands) {

    if (v >= b.min && v <= b.max) return b.code;

  }

  return bands[bands.length - 1]?.code || "mid";

}



function priceBandSimilarity(a?: number, b?: number) {

  const A = priceBand(a), B = priceBand(b);

  if (A === B) return 1;

  // near bands are closer than far bands

  const order = ["entry", "mid", "lux", "ultra"];

  const d = Math.abs(order.indexOf(A) - order.indexOf(B));

  return d === 1 ? 0.7 : d === 2 ? 0.4 : 0.2;

}



function jaccard(a: string, b: string) {

  // Treat as single labels: 1 if equal, else a soft 0.5 for suv/suv-like proximity

  if (a === b) return 1;

  const near: Record<string, string[]> = {

    suv: ["truck", "compact_sedan"],

    sedan: ["compact_sedan"],

    performance: ["sedan"],

    ev: ["suv", "sedan"],

  };

  return near[a]?.includes(b) || near[b]?.includes(a) ? 0.5 : 0;

}



// --- Mock data source (replace with your DB/Places API) ---

async function fetchNearbyDealers(lat: number, lng: number, radiusMiles: number): Promise<Dealer[]> {

  // TODO: replace with Google Places / internal DB query by geohash

  // Return a stable synthetic set for now

  const seed: Dealer[] = [

    { id: "d1", name: "Naples Toyota", oem_brand: "Toyota", lat: lat + 0.05, lng: lng + 0.02, medianPrice: 32000, inventorySample: ["RAV4", "Camry", "Highlander"] },

    { id: "d2", name: "Sutherland Honda", oem_brand: "Honda", lat: lat - 0.04, lng: lng + 0.03, medianPrice: 31000, inventorySample: ["CR-V", "Civic", "Accord"] },

    { id: "d3", name: "Autohaus BMW", oem_brand: "BMW", lat: lat + 0.08, lng: lng - 0.04, medianPrice: 58000, inventorySample: ["X5", "X3", "330i"] },

    { id: "d4", name: "Cape Coral Ford", oem_brand: "Ford", lat: lat - 0.06, lng: lng - 0.03, medianPrice: 40000, inventorySample: ["F-150", "Escape", "Explorer"] },

    { id: "d5", name: "Germain Lexus", oem_brand: "Lexus", lat: lat + 0.02, lng: lng + 0.05, medianPrice: 62000, inventorySample: ["RX", "NX", "ES"] },

  ];

  return seed.filter(d => haversineMiles({ lat, lng }, { lat: d.lat, lng: d.lng }) <= radiusMiles);

}



// --- Handler ---

export async function GET(req: Request) {

  try {

    const url = new URL(req.url);

    const brand = url.searchParams.get("brand") || "Toyota";

    const lat = parseFloat(url.searchParams.get("lat") || "26.6406");   // Cape Coral default

    const lng = parseFloat(url.searchParams.get("lng") || "-81.8723");

    const minCount = parseInt(url.searchParams.get("min") || "5");



    const weights: any = (dealerSeg as any).defaults?.similarity_weights || {

      brand_segment: 0.55, oem_region: 0.20, body_style_focus: 0.20, price_band: 0.05

    };

    const target = mapBrandToSegment(brand);



    let radius = (dealerSeg as any).defaults?.geo_competitor_radius_miles?.start || 10;

    const step = (dealerSeg as any).defaults?.geo_competitor_radius_miles?.step || 5;

    const maxR = (dealerSeg as any).defaults?.geo_competitor_radius_miles?.max || 25;



    let pool: Dealer[] = [];

    while (radius <= maxR && pool.length < minCount) {

      const found = await fetchNearbyDealers(lat, lng, radius);

      pool = found;

      if (pool.length >= minCount) break;

      radius += step;

    }



    // Score + rank

    const targetStyle = "suv"; // Optionally infer from user's inventory

    const targetMedianPrice = 35000; // Replace with dealership median

    const scored: ScoredDealer[] = pool.map((d) => {

      const dSeg = mapBrandToSegment(d.oem_brand);

      const style = inferBodyStyleFocus(d.inventorySample || []);

      const regionScore = dSeg.oem_region === target.oem_region ? 1 : 0;

      const segScore = dSeg.segment === target.segment ? 1 : 0;

      const styleScore = jaccard(style, targetStyle); // 0..1

      const priceScore = priceBandSimilarity(d.medianPrice, targetMedianPrice);

      const sim =

        weights.brand_segment * segScore +

        weights.oem_region * regionScore +

        weights.body_style_focus * styleScore +

        weights.price_band * priceScore;

      const distanceMiles = haversineMiles({ lat, lng }, { lat: d.lat, lng: d.lng });

      return { ...d, segment: dSeg.segment, oem_region: dSeg.oem_region, score: sim, distanceMiles };

    }).sort((a, b) => b.score - a.score);



    return NextResponse.json({

      brand,

      center: { lat, lng },

      radiusUsed: Math.min(radius, maxR),

      count: scored.length,

      competitors: scored.slice(0, 8) // keep a queue; show 3–5 in UI

    });

  } catch (e: any) {

    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });

  }

}
