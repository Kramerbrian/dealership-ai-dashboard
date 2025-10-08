import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const reportType = searchParams.get('type') || 'domain_ranks';

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SEMRUSH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SEMrush API key not configured' },
        { status: 500 }
      );
    }

    const semrushUrl = 'https://api.semrush.com/';
    const params = new URLSearchParams({
      type: reportType,
      key: apiKey,
      domain,
      database: 'us',
      export_columns: 'Rk,Or,Ot,Oc,Ad,At,Ac,Ar,Aw,At,Ad,At,Ac,Ar,Aw'
    });

    const response = await fetch(`${semrushUrl}?${params}`);
    const data = await response.text();

    if (!response.ok) {
      throw new Error(`SEMrush API error: ${response.status}`);
    }

    // Parse SEMrush CSV response
    const lines = data.trim().split('\n');
    const headers = lines[0].split(';');
    const rows = lines.slice(1).map(line => {
      const values = line.split(';');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      return row;
    });

    return NextResponse.json({
      success: true,
      data: {
        domain,
        reportType,
        rows,
        totalRows: rows.length,
        headers
      },
      metadata: {
        domain,
        reportType,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('SEMrush API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch SEMrush data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock data for testing
export async function POST(request: NextRequest) {
  const { domain } = await request.json();
  
  return NextResponse.json({
    success: true,
    data: {
      domain: domain || 'example.com',
      reportType: 'domain_ranks',
      rows: [
        {
          Rk: '1,234',
          Or: '45,678',
          Ot: '12,345',
          Oc: '8,901',
          Ad: '2,345',
          At: '1,234',
          Ac: '567',
          Ar: '89',
          Aw: '12'
        }
      ],
      totalRows: 1,
      headers: ['Rk', 'Or', 'Ot', 'Oc', 'Ad', 'At', 'Ac', 'Ar', 'Aw']
    },
    metadata: {
      domain: domain || 'example.com',
      reportType: 'domain_ranks',
      analyzedAt: new Date().toISOString()
    }
  });
}
