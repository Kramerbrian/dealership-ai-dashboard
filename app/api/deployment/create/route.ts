/**
 * POST /api/deployment/create
 * 
 * Create and start a new deployment workflow
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";
import { z } from "zod";
import { DeploymentWorkflowEngine } from "@/lib/deployment/workflow-engine";

const createDeploymentSchema = z.object({
  dealershipId: z.string(),
  strategyId: z.string(),
  workflow_type: z.enum(['schema', 'review_automation', 'content', 'technical']),
  auto_deploy: z.boolean().optional().default(false),
});

export const POST = createApiRoute(
  {
    endpoint: '/api/deployment/create',
    requireAuth: true,
    validateBody: createDeploymentSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { dealershipId, strategyId, workflow_type, auto_deploy } = body;

      // Get workflow config
      const config = workflow_type === 'schema' 
        ? DeploymentWorkflowEngine.SCHEMA_WORKFLOW
        : workflow_type === 'review_automation'
        ? DeploymentWorkflowEngine.REVIEW_AUTOMATION_WORKFLOW
        : DeploymentWorkflowEngine.CONTENT_WORKFLOW;

      // Create workflow record (in production, save to DB)
      const workflowId = `wf_${Date.now()}`;
      
      // Execute workflow in background
      if (auto_deploy) {
        // Start workflow execution (non-blocking)
        DeploymentWorkflowEngine.executeWorkflow(
          workflowId,
          dealershipId,
          auth?.user?.tier || 'free'
        ).catch(error => {
          console.error('Workflow execution error:', error);
        });
      }

      return NextResponse.json({
        success: true,
        workflow: {
          id: workflowId,
          dealershipId,
          strategyId,
          workflow_type,
          status: auto_deploy ? 'scanning' : 'queued',
          current_step: 0,
          total_steps: config.steps.length,
          user_time_required: config.userTimeRequired,
          auto_deploy,
          started_at: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Deployment creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create deployment' },
        { status: 500 }
      );
    }
  }
);

