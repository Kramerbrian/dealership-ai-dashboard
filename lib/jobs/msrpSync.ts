/**
 * MSRP Sync Job
 * Emits events when MSRP changes are detected
 */

import { bus } from '@/lib/events/bus';
import { prisma } from '@/lib/prisma';

interface MSRPRecord {
  vin: string;
  msrp: number;
  dealerId?: string;
}

interface PreviousMSRP {
  vin: string;
  msrp: number;
}

/**
 * Sync MSRP for a list of records and emit change events
 */
export async function syncMSRPRecords(records: MSRPRecord[]) {
  const changes: Array<{
    vin: string;
    old: number | null;
    new: number;
    deltaPct: number | null;
  }> = [];

  for (const record of records) {
    // Get previous MSRP (adjust query based on your schema)
    const prev = await prisma.$queryRaw<PreviousMSRP[] | null>`
      SELECT vin, msrp FROM "VehicleInventory" 
      WHERE vin = ${record.vin} 
      LIMIT 1
    `.catch(() => null);

    const previousMSRP = prev?.[0]?.msrp;

    // Check if MSRP changed
    if (previousMSRP !== undefined && previousMSRP !== record.msrp) {
      const deltaPct = previousMSRP
        ? ((record.msrp - previousMSRP) / previousMSRP) * 100
        : null;

      changes.push({
        vin: record.vin,
        old: previousMSRP ?? null,
        new: record.msrp,
        deltaPct,
      });

      // Update database (adjust based on your schema)
      await prisma.$executeRaw`
        UPDATE "VehicleInventory" 
        SET msrp = ${record.msrp}, updated_at = NOW() 
        WHERE vin = ${record.vin}
      `.catch((err) => {
        console.error(`Error updating MSRP for VIN ${record.vin}:`, err);
      });

      // Emit MSRP change event
      bus.emit('msrp:change', {
        vin: record.vin,
        old: previousMSRP ?? null,
        new: record.msrp,
        deltaPct,
        ts: new Date().toISOString(),
      });
    } else if (previousMSRP === undefined) {
      // New record
      await prisma.$executeRaw`
        INSERT INTO "VehicleInventory" (vin, msrp, updated_at) 
        VALUES (${record.vin}, ${record.msrp}, NOW())
        ON CONFLICT (vin) DO UPDATE SET msrp = ${record.msrp}, updated_at = NOW()
      `.catch((err) => {
        console.error(`Error inserting MSRP for VIN ${record.vin}:`, err);
      });

      bus.emit('msrp:change', {
        vin: record.vin,
        old: null,
        new: record.msrp,
        deltaPct: null,
        ts: new Date().toISOString(),
      });
    }
  }

  return changes;
}

