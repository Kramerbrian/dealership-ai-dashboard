// @ts-nocheck
/**
 * Unified Authorization System for DealershipAI
 * Consolidates RBAC with fleet-specific permissions
 *
 * @module lib/authz-unified
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret'

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type UserRole = 'owner' | 'admin' | 'manager' | 'editor' | 'analyst' | 'viewer'

export type Permission =
  // Fleet & Origins
  | 'origins:read'
  | 'origins:create'
  | 'origins:update'
  | 'origins:delete'
  | 'origins:bulk_upload'
  | 'origins:bulk_delete'
  | 'origins:export'
  | 'origins:verify'
  | 'origins:schedule_jobs'
  // Evidence & Audit
  | 'evidence:read'
  | 'evidence:capture'
  | 'evidence:export'
  | 'audit:read'
  | 'audit:export'
  // Dashboard & Analytics
  | 'dashboard:view'
  | 'analytics:view'
  | 'analytics:export'
  | 'reports:generate'
  // System & Tenants
  | 'tenants:manage'
  | 'users:read'
  | 'users:manage'
  | 'settings:read'
  | 'settings:write'
  | 'billing:view'
  | 'billing:manage'
  // AI Operations
  | 'ai:visibility_test'
  | 'ai:prompt_test'
  | 'ai:model_config'

export interface UserContext {
  tenantId: string
  userId: string
  role: UserRole
  permissions: Permission[]
  uploadLimits: UploadLimits
  email?: string
  name?: string
}

export interface UploadLimits {
  maxFileSizeMB: number
  maxBatchSize: number
  dailyUploadLimit: number
  allowedFileTypes: string[]
}

// =====================================================
// PERMISSION POLICIES
// =====================================================

/**
 * Role-based permission matrix
 * Lower roles inherit from higher roles where sensible
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    // All permissions for owners
    'origins:read', 'origins:create', 'origins:update', 'origins:delete',
    'origins:bulk_upload', 'origins:bulk_delete', 'origins:export', 'origins:verify', 'origins:schedule_jobs',
    'evidence:read', 'evidence:capture', 'evidence:export',
    'audit:read', 'audit:export',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'tenants:manage', 'users:read', 'users:manage',
    'settings:read', 'settings:write',
    'billing:view', 'billing:manage',
    'ai:visibility_test', 'ai:prompt_test', 'ai:model_config'
  ],
  admin: [
    // Admin has most permissions except billing/tenant management
    'origins:read', 'origins:create', 'origins:update', 'origins:delete',
    'origins:bulk_upload', 'origins:bulk_delete', 'origins:export', 'origins:verify', 'origins:schedule_jobs',
    'evidence:read', 'evidence:capture', 'evidence:export',
    'audit:read', 'audit:export',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'users:read', 'users:manage',
    'settings:read', 'settings:write',
    'billing:view',
    'ai:visibility_test', 'ai:prompt_test', 'ai:model_config'
  ],
  manager: [
    // Manager can manage fleet but not delete or bulk delete
    'origins:read', 'origins:create', 'origins:update',
    'origins:bulk_upload', 'origins:export', 'origins:verify',
    'evidence:read', 'evidence:capture',
    'audit:read',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'users:read',
    'settings:read',
    'ai:visibility_test', 'ai:prompt_test'
  ],
  editor: [
    // Editor can modify origins but limited bulk operations
    'origins:read', 'origins:create', 'origins:update',
    'origins:export', 'origins:verify',
    'evidence:read',
    'audit:read',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'settings:read',
    'ai:visibility_test'
  ],
  analyst: [
    // Analyst has read-only + export capabilities
    'origins:read', 'origins:export',
    'evidence:read', 'evidence:export',
    'audit:read',
    'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',
    'settings:read',
    'ai:visibility_test'
  ],
  viewer: [
    // Viewer has minimal read-only access
    'origins:read',
    'evidence:read',
    'dashboard:view', 'analytics:view',
    'settings:read'
  ]
}

/**
 * Upload limits by role
 */
export const UPLOAD_LIMITS: Record<UserRole, UploadLimits> = {
  owner: {
    maxFileSizeMB: 100,
    maxBatchSize: 10000,
    dailyUploadLimit: 100000,
    allowedFileTypes: ['text/csv', 'application/json', 'text/plain']
  },
  admin: {
    maxFileSizeMB: 100,
    maxBatchSize: 10000,
    dailyUploadLimit: 50000,
    allowedFileTypes: ['text/csv', 'application/json', 'text/plain']
  },
  manager: {
    maxFileSizeMB: 50,
    maxBatchSize: 5000,
    dailyUploadLimit: 10000,
    allowedFileTypes: ['text/csv', 'application/json']
  },
  editor: {
    maxFileSizeMB: 10,
    maxBatchSize: 1000,
    dailyUploadLimit: 5000,
    allowedFileTypes: ['text/csv']
  },
  analyst: {
    maxFileSizeMB: 0, // No uploads
    maxBatchSize: 0,
    dailyUploadLimit: 0,
    allowedFileTypes: []
  },
  viewer: {
    maxFileSizeMB: 0,
    maxBatchSize: 0,
    dailyUploadLimit: 0,
    allowedFileTypes: []
  }
}

// =====================================================
// CORE AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Extract and verify JWT token from request
 */
export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || ''
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7)
  }

  // Fallback: check cookie
  const cookieToken = req.cookies.get('auth_token')?.value
  if (cookieToken) return cookieToken

  return null
}

/**
 * Get user context from JWT token
 */
export function getUserContext(req: NextRequest): UserContext | null {
  const token = extractToken(req)
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const role = (decoded.role || 'viewer') as UserRole

    return {
      tenantId: decoded.tenant_id,
      userId: decoded.sub || decoded.user_id,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      uploadLimits: UPLOAD_LIMITS[role],
      email: decoded.email,
      name: decoded.name
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract tenant ID from request headers (legacy support)
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

// =====================================================
// PERMISSION CHECKING
// =====================================================

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserContext, permission: Permission): boolean {
  // Owners always have all permissions
  if (user.role === 'owner') return true

  return user.permissions.includes(permission)
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(user: UserContext, permissions: Permission[]): boolean {
  if (user.role === 'owner') return true
  return permissions.some(p => user.permissions.includes(p))
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(user: UserContext, permissions: Permission[]): boolean {
  if (user.role === 'owner') return true
  return permissions.every(p => user.permissions.includes(p))
}

/**
 * Assert permission or throw error
 */
export function assertPermission(user: UserContext, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Forbidden: missing permission '${permission}'`)
  }
}

// =====================================================
// LEGACY COMPATIBILITY
// =====================================================

/**
 * Check if user can write (legacy)
 */
export function canWrite(user: UserContext): boolean {
  return hasAnyPermission(user, [
    'origins:create',
    'origins:update',
    'origins:bulk_upload'
  ])
}

/**
 * Check if user can read (legacy)
 */
export function canRead(user: UserContext): boolean {
  return hasPermission(user, 'origins:read')
}

/**
 * Check if user can delete (legacy)
 */
export function canDelete(user: UserContext): boolean {
  return hasPermission(user, 'origins:delete')
}

// =====================================================
// MIDDLEWARE HELPERS
// =====================================================

/**
 * Require authentication
 */
export function requireAuth(
  handler: (req: NextRequest, user: UserContext) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const user = getUserContext(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(req, user)
  }
}

/**
 * Require specific permission
 */
export function requirePermission(
  permission: Permission,
  handler: (req: NextRequest, user: UserContext) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const user = getUserContext(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasPermission(user, permission)) {
      return NextResponse.json(
        { error: 'Forbidden', message: `Missing permission: ${permission}` },
        { status: 403 }
      )
    }

    return handler(req, user)
  }
}

/**
 * Require ANY of multiple permissions
 */
export function requireAnyPermission(
  permissions: Permission[],
  handler: (req: NextRequest, user: UserContext) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const user = getUserContext(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasAnyPermission(user, permissions)) {
      return NextResponse.json(
        { error: 'Forbidden', message: `Missing one of: ${permissions.join(', ')}` },
        { status: 403 }
      )
    }

    return handler(req, user)
  }
}

/**
 * Require specific role (legacy wrapper)
 */
export function requireRole(
  roles: UserRole[],
  handler: (req: NextRequest, user: UserContext) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const user = getUserContext(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: `Requires role: ${roles.join(' or ')}` },
        { status: 403 }
      )
    }

    return handler(req, user)
  }
}

/**
 * Require role - returns user context or NextResponse (patch signature)
 * Usage: const gate = requireRole(req, ['admin','ops']);
 *        if (gate instanceof NextResponse) return gate;
 */
export function requireRoleSimple(
  req: NextRequest,
  roles: string[]
): UserContext | NextResponse {
  const user = getUserContext(req)
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }

  if (!roles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden', message: `Requires role: ${roles.join(' or ')}` },
      { status: 403 }
    )
  }

  return user
}

/**
 * Require write permission (legacy compatibility)
 */
export function requireWrite(
  handler: (req: NextRequest, user: UserContext) => Promise<Response>
) {
  return requireAnyPermission(
    ['origins:create', 'origins:update', 'origins:bulk_upload'],
    handler
  )
}

/**
 * Legacy requireAuthz for backward compatibility
 */
export async function requireAuthz(
  req: NextRequest,
  requiredRoles: string[] = []
): Promise<UserContext> {
  const user = getUserContext(req)
  if (!user) {
    throw new Error('Unauthorized: Missing authentication')
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new Error(`Forbidden: Requires role ${requiredRoles.join(' or ')}`)
  }

  return user
}

// =====================================================
// UPLOAD VALIDATION HELPERS
// =====================================================

/**
 * Validate upload against user limits
 */
export function validateUpload(
  user: UserContext,
  fileSizeMB: number,
  fileType: string,
  batchSize: number
): { valid: boolean; reason?: string } {
  const limits = user.uploadLimits

  if (fileSizeMB > limits.maxFileSizeMB) {
    return {
      valid: false,
      reason: `File size ${fileSizeMB}MB exceeds limit of ${limits.maxFileSizeMB}MB for role ${user.role}`
    }
  }

  if (batchSize > limits.maxBatchSize) {
    return {
      valid: false,
      reason: `Batch size ${batchSize} exceeds limit of ${limits.maxBatchSize} for role ${user.role}`
    }
  }

  if (!limits.allowedFileTypes.includes(fileType)) {
    return {
      valid: false,
      reason: `File type ${fileType} not allowed for role ${user.role}. Allowed: ${limits.allowedFileTypes.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Check daily upload quota (requires DB call)
 */
export async function checkDailyQuota(
  user: UserContext,
  currentCount: number
): Promise<{ allowed: boolean; reason?: string }> {
  const limit = user.uploadLimits.dailyUploadLimit

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Daily upload limit of ${limit} origins reached for role ${user.role}`
    }
  }

  return { allowed: true }
}

// =====================================================
// AUDIT HELPERS
// =====================================================

export interface AuditEvent {
  event_type: string
  actor_user_id: string
  actor_role: UserRole
  actor_ip?: string
  tenant_id: string
  origin_id?: string
  upload_batch_id?: string
  event_data?: Record<string, any>
  success: boolean
  error_message?: string
  duration_ms?: number
}

/**
 * Create audit log entry data from user context
 */
export function createAuditData(
  user: UserContext,
  event_type: string,
  data: Partial<AuditEvent> = {}
): AuditEvent {
  return {
    event_type,
    actor_user_id: user.userId,
    actor_role: user.role,
    tenant_id: user.tenantId,
    success: true,
    ...data
  }
}

// =====================================================
// UTILITY EXPORTS
// =====================================================

// ROLE_PERMISSIONS already exported above as const (line 80)
// UPLOAD_LIMITS already exported above as const (line 147)
export type { AuditEvent }
