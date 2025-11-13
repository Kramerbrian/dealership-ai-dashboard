import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';;
import fs from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/claude/stats
 * Returns statistics about Claude exports
 */
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const stats: any = {
      totalExports: 0,
      totalDownloads: 0,
      latestVersion: '3.0.0',
      lastUpdated: new Date().toISOString(),
      fileSize: 0,
      fileSizeMB: '0',
    };

    // Get file stats from public directory
    const exportPath = path.join(process.cwd(), 'public/claude/dealershipai_claude_export.zip');

    try {
      const fileStats = await fs.stat(exportPath);
      stats.fileSize = fileStats.size;
      stats.fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
      stats.lastUpdated = fileStats.mtime.toISOString();
    } catch (err) {
      console.warn('Export file not found:', exportPath);
    }

    // Try to get stats from Supabase (if tables exist)
    if (supabaseUrl && supabaseServiceKey) {
      try {
        
        // Get total exports count
        const { count: exportsCount } = await supabase
          .from('claude_exports')
          .select('*', { count: 'exact', head: true });

        if (exportsCount !== null) {
          stats.totalExports = exportsCount;
        }

        // Get latest export info
        const { data: latestExport } = await supabase
          .from('claude_exports')
          .select('version, exported_at, download_count')
          .order('exported_at', { ascending: false })
          .limit(1)
          .single();

        if (latestExport) {
          stats.latestVersion = latestExport.version;
          stats.lastUpdated = latestExport.exported_at;
          stats.totalDownloads = latestExport.download_count || 0;
        }

        // Get total downloads across all versions
        const { data: allExports } = await supabase
          .from('claude_exports')
          .select('download_count');

        if (allExports) {
          stats.totalDownloads = allExports.reduce(
            (sum, exp) => sum + (exp.download_count || 0),
            0
          );
        }
      } catch (error) {
        // Silently fail if tables don't exist yet
        console.log('Supabase stats unavailable:', error);
      }
    }

    // Read manifest for additional info
    try {
      const manifestPath = path.join(process.cwd(), 'exports/manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      stats.latestVersion = manifest.version || stats.latestVersion;
      stats.projectName = manifest.project_name;
      stats.description = manifest.description;
    } catch (err) {
      console.warn('Manifest not found');
    }

    return NextResponse.json({
      success: true,
      stats,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
