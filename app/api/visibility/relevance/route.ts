import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    nodes: [
      { name: "Cars.com", visibility: 0.68, proximity: 0.55, authority: 0.81, scsPct: 92 },
      { name: "CarMax", visibility: 0.84, proximity: 0.32, authority: 0.91, scsPct: 88 },
      { name: "AutoTrader", visibility: 0.57, proximity: 0.60, authority: 0.79, scsPct: 86 },
      { name: "CarGurus", visibility: 0.61, proximity: 0.58, authority: 0.77, scsPct: 89 }
    ]
  });
}

