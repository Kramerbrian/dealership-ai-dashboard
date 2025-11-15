/**
 * Knowledge Graph API
 *
 * Queries the dealer knowledge graph (Neo4j Aura) for:
 * - Metrics relationships (performance, tone, feedback)
 * - Weather correlations
 * - OEM incentive impact
 * - Local event influences
 * - Causal reasoning patterns
 *
 * Phase 2: Edge + Data Intelligence
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherContext } from '@/lib/context/weather';

// Run on Vercel Edge Runtime for global low-latency
export const runtime = 'edge';

// Neo4j connection configuration
// TODO: Set these in Vercel environment variables after Neo4j Aura provisioning
const NEO4J_URI = process.env.NEO4J_URI || '';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

interface KnowledgeGraphQuery {
  query: string;
  params?: Record<string, any>;
}

interface KnowledgeGraphResponse {
  ok: boolean;
  data?: any[];
  error?: string;
  queryTime?: number;
  cached?: boolean;
}

/**
 * Query the knowledge graph
 *
 * Example queries:
 * - GET /api/knowledge-graph?dealerId=12345&type=metrics
 * - GET /api/knowledge-graph?query=causal&context=weather
 */
export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId') || undefined;
  const queryType = req.nextUrl.searchParams.get('type') || undefined || 'metrics';
  const context = req.nextUrl.searchParams.get('context') || undefined;

  // Check if Neo4j is configured
  if (!NEO4J_URI || !NEO4J_PASSWORD) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Knowledge graph not configured. Please provision Neo4j Aura and set environment variables.',
        setup: {
          required: ['NEO4J_URI', 'NEO4J_USER', 'NEO4J_PASSWORD'],
          instructions: 'Visit neo4j.com/cloud/aura to create a free instance',
        },
      } as KnowledgeGraphResponse,
      { status: 503 }
    );
  }

  // Build Cypher query based on type
  let cypherQuery = '';
  const params: Record<string, any> = {};

  switch (queryType) {
    case 'metrics':
      if (!dealerId) {
        return NextResponse.json(
          { ok: false, error: 'dealerId required for metrics query' },
          { status: 400 }
        );
      }
      cypherQuery = `
        MATCH (d:Dealer {id: $dealerId})-[:HAS_METRIC]->(m:Metric)
        WHERE m.timestamp > datetime() - duration('P7D')
        RETURN m.type as metricType, m.value as value, m.timestamp as timestamp
        ORDER BY m.timestamp DESC
        LIMIT 100
      `;
      params.dealerId = dealerId;
      break;

    case 'causal':
      if (!dealerId) {
        return NextResponse.json(
          { ok: false, error: 'dealerId required for causal query' },
          { status: 400 }
        );
      }
      cypherQuery = `
        MATCH (d:Dealer {id: $dealerId})-[:INFLUENCED_BY]->(c:Context)
        RETURN c.type as contextType, c.impact as impact, c.confidence as confidence
        ORDER BY c.confidence DESC
        LIMIT 20
      `;
      params.dealerId = dealerId;
      break;

    case 'weather':
      if (!dealerId) {
        return NextResponse.json(
          { ok: false, error: 'dealerId required for weather query' },
          { status: 400 }
        );
      }
      cypherQuery = `
        MATCH (d:Dealer {id: $dealerId})-[:LOCATED_IN]->(l:Location)
        MATCH (l)-[:HAS_WEATHER]->(w:Weather)
        WHERE w.timestamp > datetime() - duration('PT24H')
        RETURN w.condition as condition, w.temperature as temperature,
               w.timestamp as timestamp, w.impact_score as impact
        ORDER BY w.timestamp DESC
        LIMIT 1
      `;
      params.dealerId = dealerId;
      break;

    default:
      return NextResponse.json(
        {
          ok: false,
          error: `Unknown query type: ${queryType}`,
          validTypes: ['metrics', 'causal', 'weather'],
        },
        { status: 400 }
      );
  }

  try {
    const startTime = Date.now();

    // TODO: Replace with actual Neo4j driver query when configured
    // Example: const result = await session.run(cypherQuery, params);

    // MOCK RESPONSE until Neo4j is provisioned
    const mockData = generateMockResponse(queryType, dealerId || '');
    const queryTime = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: true,
        data: mockData,
        queryTime,
        cached: false,
        _note: 'Using mock data. Configure Neo4j to enable real queries.',
      } as KnowledgeGraphResponse,
      {
        headers: {
          'X-Query-Time': queryTime.toString(),
          'X-Graph-Status': 'mock',
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error: any) {
    console.error('Knowledge graph query error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Query execution failed',
        details: error.message,
      } as KnowledgeGraphResponse,
      { status: 500 }
    );
  }
}

/**
 * Generate mock data for development/testing
 * Remove this function once Neo4j is configured
 */
function generateMockResponse(queryType: string, dealerId: string) {
  switch (queryType) {
    case 'metrics':
      return [
        {
          metricType: 'lighthouse_score',
          value: 92,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          metricType: 'copilot_engagement',
          value: 0.67,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          metricType: 'tone_consistency',
          value: 0.96,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
      ];

    case 'causal':
      return [
        {
          contextType: 'weather',
          impact: 0.23,
          confidence: 0.87,
        },
        {
          contextType: 'oem_campaign',
          impact: 0.45,
          confidence: 0.92,
        },
        {
          contextType: 'local_event',
          impact: 0.12,
          confidence: 0.68,
        },
      ];

    case 'weather':
      // Return mock data if no live weather available
      // In production with WEATHER_API_KEY configured, this will be replaced by live data
      return [
        {
          condition: 'Clear',
          temperature: 72,
          timestamp: new Date().toISOString(),
          impact: 0.15,
          _note: 'Mock data - configure WEATHER_API_KEY for live weather',
        },
      ];

    default:
      return [];
  }
}

/**
 * POST endpoint for complex queries
 *
 * Body: { query: string, params: object }
 */
export async function POST(req: NextRequest) {
  if (!NEO4J_URI || !NEO4J_PASSWORD) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Knowledge graph not configured',
      },
      { status: 503 }
    );
  }

  try {
    const body: KnowledgeGraphQuery = await req.json();

    if (!body.query) {
      return NextResponse.json(
        { ok: false, error: 'Cypher query required in body' },
        { status: 400 }
      );
    }

    // TODO: Execute custom Cypher query when Neo4j is configured
    // For now, return mock response

    return NextResponse.json({
      ok: true,
      data: [],
      _note: 'Custom queries available after Neo4j configuration',
    } as KnowledgeGraphResponse);
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid request body',
        details: error.message,
      },
      { status: 400 }
    );
  }
}
