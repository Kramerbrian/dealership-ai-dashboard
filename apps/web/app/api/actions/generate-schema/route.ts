import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { schema_type, page_url } = await req.json();

    if (!schema_type || !page_url) {
      return NextResponse.json({ error: 'Schema type and page URL are required' }, { status: 400 });
    }

    // Mock AI schema generation (no external dependencies)
    const mockSchema = {
      "@context": "https://schema.org",
      "@type": schema_type === 'LocalBusiness' ? "LocalBusiness" : "Article",
      "name": `Mock ${schema_type} for ${page_url}`,
      "url": page_url,
      "description": `This is a generated schema for ${schema_type}.`
    };

    return NextResponse.json({ schema: mockSchema });
  } catch (error: any) {
    console.error('Generate schema error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate schema' },
      { status: 500 }
    );
  }
}
