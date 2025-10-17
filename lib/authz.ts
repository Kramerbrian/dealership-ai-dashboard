/**
 * Authorization utilities for tenant isolation and permission checking
 */

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret'

export interface UserContext {
  tenantId: string
  userId: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  permissions: string[]
}

/**
 * Extract tenant ID from request headers
 */
export function getTenantIdFromReq(headers: Headers): string | null {
  const auth = headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : ''
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.tenant_id || null
  } catch {
    return null
  }
}

/**
 * Get user context from JWT token
 */
export function getUserContext(req: NextRequest): UserContext | null {
  const auth = req.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : ''
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      tenantId: decoded.tenant_id,
      userId: decoded.sub || decoded.user_id,
      role: decoded.role || 'viewer',
      permissions: decoded.permissions || []
    }
  } catch {
    return null
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(user: UserContext, permission: string): boolean {
  return user.permissions.includes(permission) || user.role === 'owner'
}

/**
 * Check if user can write to resource
 */
export function canWrite(user: UserContext): boolean {
  return ['owner', 'admin', 'editor'].includes(user.role)
}

/**
 * Check if user can read resource
 */
export function canRead(user: UserContext): boolean {
  return true // All roles can read
}

/**
 * Middleware helper for authorization
 */
export function requireAuth(handler: (req: NextRequest, user: UserContext) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const user = getUserContext(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return handler(req, user)
  }
}

/**
 * Middleware helper for write permissions
 */
export function requireWrite(handler: (req: NextRequest, user: UserContext) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const user = getUserContext(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    if (!canWrite(user)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return handler(req, user)
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function requireAuthz(req: NextRequest, requiredRoles: string[] = []): Promise<UserContext> {
  const user = getUserContext(req)
  if (!user) {
    throw new Error('Unauthorized: Missing authentication')
  }
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient role')
  }
  
  return user
}