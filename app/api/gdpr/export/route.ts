import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { exportUserData } from '@/lib/db/integrations';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/gdpr/export
 * Export all user data in JSON format (GDPR compliance)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all user data from database
    const userData = await exportUserData(userId);

    // Generate export file
    const exportData = {
      user: {
        id: userId,
        exportedAt: new Date().toISOString(),
      },
      ...userData,
    };

    // Store export link (expires in 7 days)
    const exportId = generateExportId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await prisma.$executeRaw`
        INSERT INTO data_exports (user_id, export_id, data, expires_at)
        VALUES (${userId}, ${exportId}, ${JSON.stringify(exportData)}::jsonb, ${expiresAt})
      `;
    } catch (error) {
      // If table doesn't exist yet, continue without storing
      console.warn('Could not store export in database:', error);
    }

    // In production, send email with download link
    // For now, return data directly
    return NextResponse.json({
      success: true,
      data: exportData,
      downloadLink: `/api/gdpr/download/${exportId}`,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error: any) {
    console.error('GDPR export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function generateExportId(): string {
  return `export_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

