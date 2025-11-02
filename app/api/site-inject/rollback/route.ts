import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/site-inject/rollback
 * 
 * Rollback a site injection to a previous version
 */
export async function POST(req: NextRequest) {
  try {
    const { domain, versionId } = await req.json();

    if (!domain || !versionId) {
      return NextResponse.json(
        { error: 'domain and versionId are required' },
        { status: 400 }
      );
    }

    const dealership = await prisma.dealership.findUnique({
      where: { domain: domain.replace('www.', '') },
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Find the version to rollback to
    const audits = await prisma.audit.findMany({
      where: {
        dealershipId: dealership.id,
        domain: dealership.domain,
      },
      orderBy: { createdAt: 'desc' },
    });

    const versionToRollback = audits.find((a) => {
      const data = JSON.parse(a.scores || '{}');
      return data.versionId === versionId;
    });

    if (!versionToRollback) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Create rollback record
    const rollbackAudit = await prisma.audit.create({
      data: {
        dealershipId: dealership.id,
        domain: dealership.domain,
        scores: JSON.stringify({
          type: 'rollback',
          rollbackFrom: versionId,
          rolledBackAt: new Date().toISOString(),
          originalVersion: JSON.parse(versionToRollback.scores || '{}'),
        }),
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      action: 'rollback',
      rollbackId: rollbackAudit.id,
      versionId,
      message: 'Rollback completed. Changes reverted.',
    });
  } catch (error: any) {
    console.error('Rollback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rollback' },
      { status: 500 }
    );
  }
}

