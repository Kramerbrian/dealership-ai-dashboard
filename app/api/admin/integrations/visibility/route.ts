import {NextResponse} from 'next/server';
import {withAuth} from '../../../_utils/withAuth';
import {setVisibilityEngines} from '@/lib/integrations/store';

export const POST = withAuth(async ({req, tenantId}) => {
  const body = await req.json().catch(() => null);
  if (!body?.engines) {
    return NextResponse.json({error: 'engines required'}, {status: 400});
  }
  
  await setVisibilityEngines(tenantId, body.engines);
  return NextResponse.json({ok: true});
});

