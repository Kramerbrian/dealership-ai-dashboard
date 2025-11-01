import { NextResponse } from "next/server";
import { z } from "zod";

const ParamsSchema = z.object({ 
  tenantId: z.string().uuid() 
});

// Mock database interface - replace with your actual database client
interface DatabaseClient {
  execute(query: any): Promise<{ rows: any[] }>;
}

const db: DatabaseClient = {
  execute: async (query: any) => {
    console.log('Executing query:', query);
    // Return mock data for demo
    return {
      rows: [
        {
          as_of: new Date().toISOString(),
          topic: "Price",
          severity: "high",
          score: 25.5,
          verifiable: true
        },
        {
          as_of: new Date(Date.now() - 86400000).toISOString(),
          topic: "APR",
          severity: "high", 
          score: 45.0,
          verifiable: true
        }
      ]
    };
  }
};

export async function GET(_req: Request, { params }: { params: unknown }) {
  try {
    const { tenantId } = ParamsSchema.parse(params);
    
    // Get recent findings
    const findingsQuery = {
      text: `
        SELECT as_of, topic, severity, score, verifiable 
        FROM hrp_findings
        WHERE tenant_id = $1::uuid 
        ORDER BY as_of DESC 
        LIMIT 50
      `,
      values: [tenantId]
    };
    
    const findings = await db.execute(findingsQuery);
    
    // Get active quarantine
    const quarantineQuery = {
      text: `
        SELECT topic, severity, reason, active, created_at 
        FROM hrp_quarantine
        WHERE tenant_id = $1::uuid AND active = true
      `,
      values: [tenantId]
    };
    
    const quarantine = await db.execute(quarantineQuery);
    
    return NextResponse.json({ 
      findings: findings.rows,
      quarantine: quarantine.rows,
      tenantId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('HRP status API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid tenant ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch HRP status" },
      { status: 500 }
    );
  }
}
