import { NextResponse } from "next/server";
import { z } from "zod";
import { runHrpScan } from "@/jobs/runHrpScan";

const ParamsSchema = z.object({ 
  tenantId: z.string().uuid() 
});

export async function POST(_req: Request, { params }: { params: unknown }) {
  try {
    const { tenantId } = ParamsSchema.parse(params);
    
    // Run HRP scan asynchronously
    runHrpScan(tenantId).catch(error => {
      console.error(`HRP scan failed for tenant ${tenantId}:`, error);
    });
    
    return NextResponse.json({ 
      ok: true, 
      message: "HRP scan initiated",
      tenantId 
    });
    
  } catch (error) {
    console.error('HRP scan API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid tenant ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to initiate HRP scan" },
      { status: 500 }
    );
  }
}
