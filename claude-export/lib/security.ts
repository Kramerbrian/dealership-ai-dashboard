import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export function hmacValid(rawBody: string, signature: string | null | undefined, secret: string){
  if (!signature) return false
  const mac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try { return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(mac)) } catch { return false }
}

export function hashBody(rawBody: string){
  return crypto.createHash('sha256').update(rawBody).digest('hex')
}

export async function getTenantWebhookSecret(tenantId: string){
  // @ts-ignore: SQL-defined table
  const rows = await prisma.$queryRawUnsafe<{secret:string}[]>(
    'select secret from tenant_webhook_secrets where tenant_id = $1 limit 1', tenantId
  )
  return rows?.[0]?.secret || process.env.WEBHOOK_SECRET || 'dev'
}
