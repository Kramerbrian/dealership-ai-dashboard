import { db } from "@/db";
import { sql } from "drizzle-orm";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
}

/**
 * List all tenant IDs and slugs for cron job processing
 */
export async function listTenantIds(): Promise<{id: string, slug: string}[]> {
  const r = await db.execute(sql`SELECT id::text, slug FROM tenants ORDER BY created_at ASC`);
  return (r as any).rows || [];
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const r = await db.execute(sql`
    SELECT id::text, slug, name
    FROM tenants
    WHERE id = ${tenantId}::uuid
  `);
  const row = (r as any).rows?.[0];
  return row ? {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string
  } : null;
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const r = await db.execute(sql`
    SELECT id::text, slug, name
    FROM tenants
    WHERE slug = ${slug}
  `);
  const row = (r as any).rows?.[0];
  return row ? {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string
  } : null;
}