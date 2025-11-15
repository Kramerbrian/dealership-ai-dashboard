import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const brand = url.searchParams.get('brand') || undefined || 'Toyota';
    
    // Synthetic competitor data - replace with real API call
    const competitors = [
      { id: '1', name: 'Naples Honda', oem_brand: 'Honda', location: 'Naples, FL' },
      { id: '2', name: 'Terry Reid Hyundai', oem_brand: 'Hyundai', location: 'Naples, FL' },
      { id: '3', name: 'Germain Toyota of Naples', oem_brand: 'Toyota', location: 'Naples, FL' },
      { id: '4', name: 'Crown Nissan', oem_brand: 'Nissan', location: 'Naples, FL' },
      { id: '5', name: 'Classic Honda', oem_brand: 'Honda', location: 'Naples, FL' },
    ];
    
    // Filter by brand if provided
    const filtered = brand 
      ? competitors.filter(c => c.oem_brand.toLowerCase() === brand.toLowerCase())
      : competitors;
    
    return NextResponse.json(filtered);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

