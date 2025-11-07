import {NextResponse} from 'next/server';
import dealerSeg from '@/configs/dealer_segment_table.json';
import {withAuth} from '../_utils/withAuth';
import {cacheJSON} from '@/lib/cache';

function haversineMiles(a: {lat: number; lng: number}, b: {lat: number; lng: number}) {
  const R = 3958.8;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function mapSeg(brand: string) {
  const t: any = dealerSeg;
  for (const row of t.brand_segments || []) {
    if ((row.brands || []).map((x: string) => x.toLowerCase()).includes(brand.toLowerCase())) {
      return row;
    }
  }
  return {segment: t.fallbacks?.if_brand_unknown || 'import_mainstream', oem_region: 'Mixed'};
}

async function fetchNearby(lat: number, lng: number, r: number) {
  const seed = [
    {id: 'd1', name: 'Naples Toyota', oem_brand: 'Toyota', lat: lat + 0.05, lng: lng + 0.02, medianPrice: 32000},
    {id: 'd2', name: 'Sutherland Honda', oem_brand: 'Honda', lat: lat - 0.04, lng: lng + 0.03, medianPrice: 31000},
    {id: 'd3', name: 'Autohaus BMW', oem_brand: 'BMW', lat: lat + 0.08, lng: lng - 0.04, medianPrice: 58000},
    {id: 'd4', name: 'Cape Coral Ford', oem_brand: 'Ford', lat: lat - 0.06, lng: lng - 0.03, medianPrice: 40000},
    {id: 'd5', name: 'Germain Lexus', oem_brand: 'Lexus', lat: lat + 0.02, lng: lng + 0.05, medianPrice: 62000}
  ];
  return seed.filter(d => haversineMiles({lat, lng}, {lat: d.lat, lng: d.lng}) <= r);
}

export const GET = withAuth(async ({req, tenantId}) => {
  try {
    const url = new URL(req.url);
    const brand = url.searchParams.get('brand') || 'Toyota';
    const lat = parseFloat(url.searchParams.get('lat') || '26.6406');
    const lng = parseFloat(url.searchParams.get('lng') || '-81.8723');
    const minCount = 5;
    const w: any = (dealerSeg as any).defaults?.similarity_weights || {
      brand_segment: 0.55,
      oem_region: 0.2,
      body_style_focus: 0.2,
      price_band: 0.05
    };
    const target = mapSeg(brand);
    
    const cacheKey = `competitors:${tenantId}:${brand}:${lat.toFixed(3)}:${lng.toFixed(3)}`;
    const data = await cacheJSON(cacheKey, 300, async () => {
      let radius = 10;
      let pool: any[] = [];
      
      while (radius <= 25 && pool.length < minCount) {
        pool = await fetchNearby(lat, lng, radius);
        if (pool.length >= minCount) break;
        radius += 5;
      }
      
      const scored = pool.map(d => {
        const dSeg = mapSeg(d.oem_brand);
        const score = w.brand_segment * (dSeg.segment === target.segment ? 1 : 0) +
                     w.oem_region * (dSeg.oem_region === target.oem_region ? 1 : 0) +
                     w.body_style_focus * 0.8 +
                     w.price_band * 0.7;
        return {
          ...d,
          segment: dSeg.segment,
          oem_region: dSeg.oem_region,
          score,
          distanceMiles: haversineMiles({lat, lng}, {lat: d.lat, lng: d.lng})
        };
      }).sort((a, b) => b.score - a.score);
      
      return {
        brand,
        center: {lat, lng},
        radiusUsed: radius,
        count: scored.length,
        competitors: scored.slice(0, 8)
      };
    });
    
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({error: e?.message || 'failed'}, {status: 500});
  }
});

