import { db } from '@/lib/db';
import { publish } from '@/lib/events/bus';

export async function pumpOutbox(limit = 500) {
  // Note: This uses raw SQL for the EventOutbox table
  // Adjust based on your actual database setup (SQLite vs PostgreSQL)
  try {
    const rows = await db.$queryRawUnsafe<any[]>(
      `SELECT * FROM "EventOutbox" WHERE "processedAt" IS NULL ORDER BY "createdAt" ASC LIMIT $1`,
      limit
    );

    for (const r of rows) {
      try {
        await publish(r.topic as any, r.payload);
        await db.$executeRawUnsafe(
          `UPDATE "EventOutbox" SET "processedAt" = datetime('now') WHERE id = $1`,
          r.id
        );
      } catch (e) {
        console.error('[outbox] publish error', e);
      }
    }
  } catch (error) {
    console.error('[outbox] query error', error);
  }
}

