/**
 * Opportunities API with Cursor-Based Pagination
 * GET /api/opportunities?domain=example.com&limit=50&cursor=<base64-encoded>
 * 
 * Uses impact_score DESC, id DESC for deterministic ordering
 * Cursor format (base64): impact_score:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface OpportunityRow {
  id: string;
  title: string;
  description: string;
  impact_score: number;
  effort: 'low' | 'medium' | 'high';
  category: string;
  estimated_aiv_gain: number;
}

interface DecodedCursor {
  impact_score: number;
  id: string;
}

/**
 * Decode base64 cursor: format is "impact_score:id"
 */
function decodeCursor(cursor: string): DecodedCursor | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 2) return null;
    
    const impact_score = parseFloat(parts[0]);
    if (isNaN(impact_score)) return null;
    
    return {
      impact_score,
      id: parts[1]
    };
  } catch {
    return null;
  }
}

/**
 * Encode cursor to base64: format is "impact_score:id"
 */
function encodeCursor(impact_score: number, id: string): string {
  const raw = `${impact_score}:${id}`;
  return Buffer.from(raw, 'utf8').toString('base64');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || undefined || '10', 10), 50); // Max 50 per spec
    const cursorParam = searchParams.get('cursor') || undefined;

    // Validate domain parameter
    if (!domain) {
      return NextResponse.json(
        { error: 'Missing required parameter: domain' },
        { status: 400 }
      );
    }

    // Decode cursor if present
    let lastImpact: number | null = null;
    let lastId: string | null = null;
    
    if (cursorParam) {
      const decoded = decodeCursor(cursorParam);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid cursor format. Expected base64-encoded "impact_score:id"' },
          { status: 400 }
        );
      }
      lastImpact = decoded.impact_score;
      lastId = decoded.id;
    }

    // Build query with cursor-based pagination
    try {
      const params: any[] = [domain];
      let query = `
        SELECT 
          id,
          title,
          description,
          impact_score,
          effort,
          category,
          estimated_aiv_gain
        FROM opportunities
        WHERE domain = $1
      `;

      // Apply cursor filtering for subsequent pages
      if (cursorParam && lastImpact !== null && lastId) {
        query += `
          AND (
            impact_score < $2
            OR (impact_score = $2 AND id < $3)
          )
        `;
        params.push(lastImpact, lastId);
      }

      // Order by impact_score DESC, id DESC (tie-breaker for stable ordering)
      // Fetch limit + 1 to detect if there's a next page
      query += `
        ORDER BY impact_score DESC, id DESC
        LIMIT $${params.length + 1}
      `;
      params.push(limit + 1);

      // Execute query using Prisma raw SQL
      const result = await db.$queryRawUnsafe<OpportunityRow[]>(query, ...params);
      
      const rows = result;
      const hasNextPage = rows.length > limit;
      const items = hasNextPage ? rows.slice(0, limit) : rows;

      // Generate nextCursor if there's more data
      let nextCursor: string | null = null;
      if (hasNextPage && rows[limit]) {
        const lastRow = rows[limit];
        nextCursor = encodeCursor(lastRow.impact_score, lastRow.id);
      }

      return NextResponse.json({
        opportunities: items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          impact_score: item.impact_score,
          effort: item.effort,
          category: item.category,
          estimated_aiv_gain: item.estimated_aiv_gain
        })),
        nextCursor
      });

    } catch (dbError: any) {
      // If opportunities table doesn't exist yet, return mock data for development
      if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation')) {
        console.warn('Opportunities table not found, using mock data:', dbError.message);
        
        // Generate mock opportunities ranked by impact_score
        const mockOpportunities: OpportunityRow[] = [
          {
            id: 'opp-1',
            title: 'Optimize Google Business Profile',
            description: 'Your Google Business Profile is missing key information that AI systems use to understand your business.',
            impact_score: 85,
            effort: 'low',
            category: 'citations',
            estimated_aiv_gain: 15
          },
          {
            id: 'opp-2',
            title: 'Improve Local Citation Consistency',
            description: 'Business information is inconsistent across different directories and platforms.',
            impact_score: 72,
            effort: 'medium',
            category: 'citations',
            estimated_aiv_gain: 12
          },
          {
            id: 'opp-3',
            title: 'Add FAQ Schema Markup',
            description: 'FAQ schema helps AI assistants understand common questions about your dealership.',
            impact_score: 65,
            effort: 'low',
            category: 'schema',
            estimated_aiv_gain: 8
          },
          {
            id: 'opp-4',
            title: 'Enhance E-E-A-T Signals',
            description: 'Improve Experience, Expertise, Authoritativeness, and Trustworthiness signals.',
            impact_score: 58,
            effort: 'high',
            category: 'content',
            estimated_aiv_gain: 10
          },
          {
            id: 'opp-5',
            title: 'Implement Review Response Strategy',
            description: 'Respond to reviews more quickly to improve reputation signals.',
            impact_score: 45,
            effort: 'medium',
            category: 'reputation',
            estimated_aiv_gain: 6
          }
        ];

        // Apply cursor filtering if present
        let filtered = mockOpportunities;
        if (cursorParam && lastImpact !== null && lastId) {
          filtered = mockOpportunities.filter(opp => {
            return opp.impact_score < lastImpact! || 
                   (opp.impact_score === lastImpact! && opp.id < lastId!);
          });
        }

        // Sort by impact_score DESC, id DESC
        filtered.sort((a, b) => {
          if (b.impact_score !== a.impact_score) {
            return b.impact_score - a.impact_score;
          }
          return b.id.localeCompare(a.id);
        });

        const hasNextPage = filtered.length > limit;
        const items = hasNextPage ? filtered.slice(0, limit) : filtered;

        let nextCursor: string | null = null;
        if (hasNextPage && filtered[limit]) {
          const lastRow = filtered[limit];
          nextCursor = encodeCursor(lastRow.impact_score, lastRow.id);
        }

        return NextResponse.json({
          opportunities: items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            impact_score: item.impact_score,
            effort: item.effort,
            category: item.category,
            estimated_aiv_gain: item.estimated_aiv_gain
          })),
          nextCursor
        });
      }

      // Re-throw other database errors
      throw dbError;
    }

  } catch (error: any) {
    console.error('Opportunities API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
