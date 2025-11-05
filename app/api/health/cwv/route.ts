import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({ 
    lcp_ms: 2600, 
    lcp_delta_ms: 200, 
    cls: 0.12, 
    inp_ms: 180 
  });
}

