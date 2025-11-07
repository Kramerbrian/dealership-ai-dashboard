import {NextResponse} from 'next/server';
import {withAuth} from '../../_utils/withAuth';
import {cacheJSON} from '@/lib/cache';
import {schemaToPulses} from '@/lib/adapters/schema';
import {ga4ToPulses} from '@/lib/adapters/ga4';
import {reviewsToPulses} from '@/lib/adapters/reviews';
import {visibilityToPulses} from '@/lib/adapters/visibility';

export const GET = withAuth(async ({req, tenantId}) => {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') || '';
  const placeId = url.searchParams.get('placeId') || '';
  
  const cacheKey = `pulse:${tenantId}:${domain}:${placeId}`;
  const feed = await cacheJSON(cacheKey, 60, async () => {
    const [schemaP, ga4P, reviewsP, visP] = await Promise.all([
      schemaToPulses(domain),
      ga4ToPulses(domain),
      reviewsToPulses({placeId, domain}),
      visibilityToPulses(domain)
    ]);
    return [...schemaP, ...ga4P, ...reviewsP, ...visP];
  });
  
  return NextResponse.json(feed);
});

