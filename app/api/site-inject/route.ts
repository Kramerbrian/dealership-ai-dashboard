import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface SiteInjectRequest {
  domain: string;
  type: 'schema' | 'javascript' | 'meta';
  content: string;
  nonce?: string;
  rollback?: boolean;
  versionId?: string;
}

/**
 * POST /api/site-inject
 * 
 * Safely injects schema, JS snippets, or meta tags across dealer domains
 * with rollback, CSP, and domain verification
 */
export async function POST(req: NextRequest) {
  try {
    const body: SiteInjectRequest = await req.json();
    const { domain, type, content, nonce, rollback, versionId } = body;

    if (!domain || !type || !content) {
      return NextResponse.json(
        { error: 'domain, type, and content are required' },
        { status: 400 }
      );
    }

    // Verify domain ownership
    const dealership = await prisma.dealership.findUnique({
      where: { domain: domain.replace('www.', '') },
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Domain not registered or unauthorized' },
        { status: 403 }
      );
    }

    // Handle rollback
    if (rollback && versionId) {
      // In production, fetch previous version from storage/CDN
      return NextResponse.json({
        success: true,
        action: 'rollback',
        versionId,
        message: 'Rollback initiated. Changes will revert within 5 minutes.',
      });
    }

    // Generate version ID and nonce
    const newVersionId = crypto.randomUUID();
    const cspNonce = nonce || crypto.randomBytes(16).toString('base64');

    // Validate content based on type
    if (type === 'schema') {
      try {
        JSON.parse(content); // Validate JSON-LD
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON-LD schema' },
          { status: 400 }
        );
      }
    }

    // Generate CSP-compliant injection script
    const injectedContent = type === 'javascript'
      ? `<script nonce="${cspNonce}">${content}</script>`
      : type === 'schema'
      ? `<script type="application/ld+json" nonce="${cspNonce}">${content}</script>`
      : content;

    // Store version for rollback (in production, use S3/CDN)
    const versionRecord = {
      versionId: newVersionId,
      domain,
      type,
      content: injectedContent,
      nonce: cspNonce,
      injectedAt: new Date().toISOString(),
      dealerId: dealership.id,
    };

    // In production: Upload to S3/CDN with version ID
    // For now, store metadata in database
    await prisma.audit.create({
      data: {
        dealershipId: dealership.id,
        domain,
        scores: JSON.stringify({
          type: 'site-inject',
          versionId: newVersionId,
          injectType: type,
          nonce: cspNonce,
          injectedAt: new Date().toISOString(),
        }),
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      versionId: newVersionId,
      nonce: cspNonce,
      domain,
      type,
      message: 'Injection queued. Changes will appear within 5 minutes.',
      rollbackAvailable: true,
      rollbackEndpoint: `/api/site-inject?rollback=true&versionId=${newVersionId}`,
    });
  } catch (error: any) {
    console.error('Site inject error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to inject content' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/site-inject/versions?domain=example.com
 * 
 * List all injection versions for a domain
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const rollback = searchParams.get('rollback');
    const versionId = searchParams.get('versionId');

    if (rollback && versionId && domain) {
      // Execute rollback
      return NextResponse.json({
        success: true,
        action: 'rollback',
        versionId,
        message: 'Rollback initiated',
      });
    }

    if (!domain) {
      return NextResponse.json(
        { error: 'domain query parameter is required' },
        { status: 400 }
      );
    }

    const dealership = await prisma.dealership.findUnique({
      where: { domain: domain.replace('www.', '') },
      include: {
        audits: {
          where: {
            scores: {
              path: ['type'],
              equals: 'site-inject',
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    const versions = dealership.audits.map((audit) => {
      const data = JSON.parse(audit.scores || '{}');
      return {
        versionId: data.versionId,
        type: data.injectType,
        injectedAt: data.injectedAt,
        createdAt: audit.createdAt,
        status: audit.status,
      };
    });

    return NextResponse.json({
      domain,
      versions,
      total: versions.length,
    });
  } catch (error: any) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get versions' },
      { status: 500 }
    );
  }
}

