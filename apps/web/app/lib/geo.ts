// app/lib/geo.ts
import { headers } from 'next/headers';

export function getGeo() {
  const h = headers();
  const city = h.get('x-vercel-ip-city') || '';
  const region = h.get('x-vercel-ip-country-region') || '';
  const country = h.get('x-vercel-ip-country') || '';
  return { city, region, country };
}
