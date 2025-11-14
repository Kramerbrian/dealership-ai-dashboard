import { NextResponse } from "next/server";

// Run on Vercel Edge Runtime for global low-latency
export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const key = process.env.GMAPS_KEY;

  if (!lat || !lon || !key) {
    return NextResponse.json({
      competitor: "a local competitor",
      city: "your area",
      region: "",
    });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=Nissan%20dealer&type=car_dealer&location=${lat},${lon}&radius=10000&key=${key}`;

  try {
    const data = await fetch(url, { cache: "no-store" }).then((r) => r.json());
    const competitor = data.results?.[0]?.name || "a local competitor";
    const city = data.results?.[0]?.vicinity?.split(",")[0] || "your area";
    return NextResponse.json({ competitor, city, region: "" });
  } catch {
    return NextResponse.json({
      competitor: "a local competitor",
      city: "your area",
      region: "",
    });
  }
}
