import { NextResponse } from "next/server";
import { z } from "zod";

const ParamsSchema = z.object({ 
  tenantId: z.string().uuid() 
});

const BodySchema = z.object({ 
  topic: z.string().min(1) 
});

// Mock database interface - replace with your actual database client
interface DatabaseClient {
  execute(query: any): Promise<{ rowCount: number }>;
}

const db: DatabaseClient = {
  execute: async (query: any) => {
    console.log('Executing query:', query);
    return { rowCount: 1 };
  }
};

export async function POST(req: Request, { params }: { params: unknown }) {
  try {
    const { tenantId } = ParamsSchema.parse(params);
    const { topic } = BodySchema.parse(await req.json());
    
    // Resolve quarantine for the topic
    const resolveQuery = {
      text: `
        UPDATE hrp_quarantine 
        SET active = false, resolved_at = now()
        WHERE tenant_id = $1::uuid AND topic = $2 AND active = true
      `,
      values: [tenantId, topic]
    };
    
    const result = await db.execute(resolveQuery);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "No active quarantine found for this topic" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      ok: true,
      message: `Quarantine resolved for topic: ${topic}`,
      tenantId,
      topic,
      resolvedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('HRP resolve API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to resolve quarantine" },
      { status: 500 }
    );
  }
}
