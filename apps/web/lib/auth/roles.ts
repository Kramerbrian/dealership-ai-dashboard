import { NextRequest } from 'next/server';

export function requireRole(req: NextRequest, roles: string[] = ['admin']) {
  const role = req.headers.get('x-role') || '';
  if (!roles.includes(role)) {
    throw new Error('forbidden');
  }
}

export function requireRoleAndTenant(req: NextRequest, roles: string[] = ['admin']) {
  const role = req.headers.get('x-role') || '';
  const tenant = req.headers.get('x-tenant') || '';
  if (!tenant) throw new Error('x-tenant header required');
  if (!roles.includes(role)) throw new Error('forbidden');
  return { role, tenant };
}

