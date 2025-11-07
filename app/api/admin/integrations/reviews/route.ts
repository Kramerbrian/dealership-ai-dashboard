import {NextResponse} from 'next/server';
import {withAuth} from '../../../_utils/withAuth';
import {setReviewsPlaceId} from '@/lib/integrations/store';

export const POST = withAuth(async ({req, tenantId}) => {
  const body = await req.json().catch(() => null);
  if (!body?.placeId) {
    return NextResponse.json({error: 'placeId required'}, {status: 400});
  }
  
  await setReviewsPlaceId(tenantId, body.placeId, 'google');
  return NextResponse.json({ok: true});
});

