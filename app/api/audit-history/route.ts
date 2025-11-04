import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/audit-history
 * 
 * Returns the last 5 audit reports from /public/audit-reports/
 */
export async function GET() {
  try {
    const reportsDir = path.join(process.cwd(), 'public', 'audit-reports');
    
    // Check if directory exists
    if (!fs.existsSync(reportsDir)) {
      return NextResponse.json({ 
        audits: [],
        message: 'Audit reports directory does not exist' 
      });
    }

    // Read directory and filter for CSV files
    const files = fs
      .readdirSync(reportsDir)
      .filter((f) => f.endsWith('.csv'))
      .map((f) => {
        const filePath = path.join(reportsDir, f);
        const stats = fs.statSync(filePath);
        return {
          file: f,
          modified: stats.mtime,
          mtimeMs: stats.mtimeMs,
        };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs) // Sort by most recent first
      .slice(0, 5) // Get last 5
      .map((f) => ({
        file: f.file,
        modified: f.modified.toISOString(),
        url: `/audit-reports/${f.file}`,
      }));

    return NextResponse.json({ 
      audits: files,
      count: files.length 
    });
  } catch (error) {
    console.error('Error reading audit history:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to load audit history',
        message: error instanceof Error ? error.message : 'Unknown error',
        audits: []
      },
      { status: 500 }
    );
  }
}

