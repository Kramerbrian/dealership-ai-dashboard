import {NextResponse} from 'next/server';
import {withAuth} from '../../_utils/withAuth';
import {cacheJSON} from '@/lib/cache';
import {getIntegration} from '@/lib/integrations/store';

export const GET = withAuth(async ({req, tenantId}) => {
  const url = new URL(req.url);
  const placeIdQ = url.searchParams.get('placeId');
  const integ = await getIntegration(tenantId, 'reviews');
  const placeId = placeIdQ || integ?.metadata?.place_id || '';
  
  const cacheKey = `reviews:${tenantId}:${placeId}`;
  const data = await cacheJSON(cacheKey, 120, async () => {
    if (!placeId) {
      return {
        placeId: null,
        avgRating: 4.3,
        totalReviews: 1276,
        last30New: 84,
        replyRatePct: 61,
        replyLatencyHours: 72,
        recentUnanswered: 12,
        lastUpdatedISO: new Date().toISOString(),
        connected: false
      };
    }
    
    return {
      placeId,
      avgRating: 4.5,
      totalReviews: 1650,
      last30New: 112,
      replyRatePct: 78,
      replyLatencyHours: 28,
      recentUnanswered: 4,
      lastUpdatedISO: new Date().toISOString(),
      connected: true
    };
  });
  
  return NextResponse.json(data);
});

