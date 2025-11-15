// app/lib/geo.ts
import { headers } from 'next/headers';

export async function getGeo() {
  const h = await headers();
  const city = h.get('x-vercel-ip-city') || '';
  const region = h.get('x-vercel-ip-country-region') || '';
  const country = h.get('x-vercel-ip-country') || '';
  return { city, region, country };
}
