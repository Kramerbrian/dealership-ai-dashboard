import { NextResponse } from 'next/server';

/**
 * GET /api/docs/orchestrator
 * 
 * Returns orchestrator documentation including overview, Mermaid sequence diagram,
 * and example SDK JSON
 */
export async function GET() {
  const overview = `# DealershipAI Orchestrator

## Overview
The Orchestrator is the autonomous engine that manages multi-step workflows for dealership optimization.

## Key Capabilities
- Agentic Fix Packs (AEO, Schema, GBP)
- Fleet-wide analysis (5,000+ rooftops)
- Autonomous Trust Engine
- Closed-loop calibration

## Architecture
The orchestrator coordinates between:
- AI visibility scanners
- Site injection APIs
- Fix generation engines
- Verification systems`;

  const sequenceMermaid = `sequenceDiagram
    participant D as Dashboard
    participant O as Orchestrator
    participant S as Scanner
    participant F as Fix Engine
    participant I as Site Inject
    
    D->>O: Trigger Fix Pack
    O->>S: Scan for Issues
    S-->>O: Return Issues
    O->>F: Generate Fixes
    F-->>O: Return Fix Plans
    O->>I: Deploy Fixes
    I-->>O: Confirm Deployment
    O->>S: Schedule Verification
    S-->>O: Verify Fix
    O-->>D: Update Status`;

  const exampleSdkJson = {
    orchestrator: {
      version: '1.0.0',
      endpoints: {
        fixPack: '/api/orchestrate/agentic-fix-pack',
        fleetRefresh: '/api/cron/fleet-refresh',
        autonomousEngine: '/api/trust/autonomous-engine',
      },
      request: {
        dealerId: 'dealer-123',
        fixType: 'schema',
        options: {
          autoDeploy: true,
          requireApproval: false,
          verifyAfter: 24,
        },
      },
      response: {
        success: true,
        fixesGenerated: 3,
        deployed: 2,
        queued: 1,
        estimatedGain: 18,
      },
    },
  };

  return NextResponse.json({
    overview,
    sequenceMermaid,
    exampleSdkJson,
  });
}

