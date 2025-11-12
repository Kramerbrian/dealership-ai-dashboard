/**
 * Admin Setup API
 * Creates the telemetry_events table in Supabase
 * Run once to initialize the database schema
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSbAdmin } from '@/lib/supabase';
import { createAdminRoute } from '@/lib/api/enhanced-route';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SetupSchema = z.object({
  tenantId: z.string().optional(),
});

export const POST = createAdminRoute(async (req: NextRequest, { tenantId }) => {
  try {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.' },
        { status: 500 }
      );
    }

    const sbAdmin = getSbAdmin();
    if (!sbAdmin) {
      return NextResponse.json(
        { error: 'Supabase client initialization failed' },
        { status: 500 }
      );
    }

    // SQL to create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id BIGSERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        payload JSONB,
        ts BIGINT,
        ip TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(type);
      CREATE INDEX IF NOT EXISTS idx_telemetry_events_ts ON telemetry_events(ts DESC);
      CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at ON telemetry_events(created_at DESC);
    `;

    // Execute the SQL using Supabase RPC or direct SQL execution
    // Note: Supabase JS client doesn't support direct SQL execution
    // You'll need to run this in Supabase SQL Editor or use their migration system
    
    // Check if table exists
    const { data, error } = await sbAdmin
      .from('telemetry_events')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist - return SQL to run manually
      return NextResponse.json({
        success: false,
        message: 'Table does not exist. Run this SQL in Supabase SQL Editor:',
        sql: createTableSQL,
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Paste the SQL above',
          '4. Run the query',
          '5. Or use the migration file at: supabase/migrations/001_telemetry_events.sql'
        ]
      });
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'telemetry_events table already exists',
      tableExists: true
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        message: 'Run the SQL migration manually in Supabase SQL Editor'
      },
      { status: 500 }
    );
  }
}, {
  schema: SetupSchema,
});

export const GET = createAdminRoute(async () => {
  try {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { tableExists: false, error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.' },
        { status: 503 }
      );
    }

    const sbAdmin = getSbAdmin();
    if (!sbAdmin) {
      return NextResponse.json(
        { tableExists: false, error: 'Supabase client initialization failed' },
        { status: 503 }
      );
    }
    
    // Check if table exists
    const { data, error } = await sbAdmin
      .from('telemetry_events')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      return NextResponse.json({
        tableExists: false,
        message: 'Table does not exist. Run the migration SQL to create it.',
        migrationFile: 'supabase/migrations/001_telemetry_events.sql'
      });
    }

    if (error) {
      throw error;
    }

    // Get table stats (reuse sbAdmin from above)
    const { count } = await sbAdmin
      .from('telemetry_events')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      tableExists: true,
      eventCount: count || 0,
      message: 'telemetry_events table is ready'
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        tableExists: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}

