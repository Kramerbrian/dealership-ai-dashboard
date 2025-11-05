/**
 * GET /api/deployment/[workflowId]/assets
 * 
 * Get deployment assets (downloadable files)
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";

export const GET = createApiRoute(
  {
    endpoint: '/api/deployment/[workflowId]/assets',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const workflowId = req.url.split('/').slice(-2, -1)[0];
      
      if (!workflowId) {
        return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
      }

      // In production, query actual database
      // For now, return mock assets
      const assets = [
        {
          id: '1',
          workflowId,
          asset_type: 'wordpress_plugin',
          file_name: 'dealershipai-schema.zip',
          file_url: 'https://s3.amazonaws.com/appraise-cdn/plugins/schema-123.zip',
          download_count: 0,
        },
        {
          id: '2',
          workflowId,
          asset_type: 'schema_json',
          file_name: 'schemas.json',
          file_url: null,
          file_content: JSON.stringify({ schemas: [] }, null, 2),
          download_count: 0,
        }
      ];

      return NextResponse.json({
        success: true,
        assets
      });
    } catch (error) {
      console.error('Assets fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assets' },
        { status: 500 }
      );
    }
  }
);

