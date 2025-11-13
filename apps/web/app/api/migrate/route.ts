import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Database Migration Verification Endpoint
 *
 * This endpoint verifies that Pulse tables exist in the database.
 * Migrations are now run using `npx prisma migrate deploy` in your local terminal
 * with the production environment variables.
 *
 * Usage:
 *   GET https://your-domain.vercel.app/api/migrate?secret=YOUR_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Security check
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const expectedSecret = process.env.MIGRATION_SECRET || 'temp-migrate-pulse-v2';

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid secret' },
        { status: 401 }
      );
    }

    // Verify database environment variables
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    // Check database connection and Pulse tables
    const prisma = new PrismaClient();

    try {
      // Query for Pulse tables
      const tables: any = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name LIKE 'Pulse%'
        ORDER BY table_name
      `;

      // Check for specific Pulse tables
      const pulseTableNames = tables.map((t: any) => t.table_name);
      const requiredTables = ['PulseScore', 'PulseScenario', 'PulseRadarData', 'PulseTrend'];
      const missingTables = requiredTables.filter(t => !pulseTableNames.includes(t));

      await prisma.$disconnect();

      if (missingTables.length > 0) {
        return NextResponse.json({
          success: false,
          message: 'Some Pulse tables are missing',
          existingTables: pulseTableNames,
          missingTables,
          instructions: 'Run migrations using: npx dotenv -e .env.production -- npx prisma migrate deploy',
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: 'All Pulse tables exist',
        tables: pulseTableNames,
        timestamp: new Date().toISOString(),
      });

    } catch (queryError: any) {
      await prisma.$disconnect();
      throw queryError;
    }

  } catch (error: any) {
    console.error('Migration verification error:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
