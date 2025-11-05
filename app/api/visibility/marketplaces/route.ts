import { NextResponse } from "next/server";
import marketplaceData from "@/data/marketplaces.json";

export const revalidate = 300;

export async function GET() {
  return NextResponse.json(marketplaceData);
}

