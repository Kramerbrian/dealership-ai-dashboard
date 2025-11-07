import {NextResponse} from 'next/server';
import {requireTenant} from '@/lib/auth/tenant';

type Handler = (ctx: {req: Request; tenantId: string}) => Promise<Response>;

export function withAuth(handler: Handler) {
  return async (req: Request) => {
    try {
      const {tenantId} = requireTenant();
      return await handler({req, tenantId});
    } catch (e: any) {
      const status = e?.status || 500;
      return NextResponse.json({error: e?.message || 'error'}, {status});
    }
  };
}

